import { createClient } from '@supabase/supabase-js';
import { Session } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const QUEUE_KEY = 'session-queue';
const BUCKET_NAME = 'sessions';

export async function addToQueue(session: Session): Promise<void> {
  try {
    await processQueue();
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

async function processQueue(): Promise<void> {
  
}

setInterval(processQueue, 60000);
