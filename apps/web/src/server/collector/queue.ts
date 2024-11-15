import { Session } from "@/types";


export async function addToQueue(session: Session): Promise<void> {
  try {
    console.log('Adding to queue:', session);
    await processQueue();
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

async function processQueue(): Promise<void> {
  
}

setInterval(processQueue, 60000);
