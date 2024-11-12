import { createClient } from '@supabase/supabase-js';
import { Session } from '@session-recorder/types';
import { createClient as createRedisClient } from 'redis';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const redis = createRedisClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

const QUEUE_KEY = 'session-queue';
const BUCKET_NAME = 'sessions';

export async function addToQueue(session: Session): Promise<void> {
  try {
    await redis.rPush(QUEUE_KEY, JSON.stringify(session));
    await processQueue();
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

async function processQueue(): Promise<void> {
  try {
    const data = await redis.lIndex(QUEUE_KEY, 0);
    
    if (!data) return;

    const session: Session = JSON.parse(data);

    // Store in Supabase Storage
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(
        `${session.siteId}/${session.id}/events.json`,
        JSON.stringify(session.events),
        {
          contentType: 'application/json',
          upsert: true
        }
      );

    if (error) {
      throw error;
    }

    await redis.lPop(QUEUE_KEY);
  } catch (error) {
    console.error('Error processing queue:', error);
    throw error;
  }
}

setInterval(processQueue, 60000);
