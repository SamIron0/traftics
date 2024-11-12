import { createClient } from 'redis';
import { Session } from '@session-recorder/types';
import { storeSession } from './storage';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

const QUEUE_KEY = 'session-queue';

export async function addToQueue(session: Session): Promise<void> {
  try {
    // Add to Redis list
    await redis.rPush(QUEUE_KEY, JSON.stringify(session));
    
    // Process queue immediately
    await processQueue();
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

async function processQueue(): Promise<void> {
  try {
    // Get session from queue (but don't remove yet)
    const data = await redis.lIndex(QUEUE_KEY, 0);
    
    if (!data) return;

    const session: Session = JSON.parse(data);

    // Store in S3
    await storeSession(
      session.siteId,
      session.id,
      session.events
    );

    // Remove from queue only after successful processing
    await redis.lPop(QUEUE_KEY);
  } catch (error) {
    console.error('Error processing queue:', error);
    throw error;
  }
}

// Process queue periodically in case of failures
setInterval(processQueue, 60000);
