import express from 'express';
import { Redis } from '@upstash/redis';
import { processScreenshot } from './screenshot';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

async function processQueue() {
  while (true) {
    try {
      const job = await redis.rpop('screenshot-queue');
      if (job) {
        const data = JSON.parse(job);
        await processScreenshot(data);
      }
      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error processing queue:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Screenshot service running on port ${port}`);
  processQueue();
}); 