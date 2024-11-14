
export async function addToQueue(): Promise<void> {
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
