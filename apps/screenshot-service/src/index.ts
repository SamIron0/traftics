import express from 'express';
import { processScreenshot } from './screenshot';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

app.post('/screenshot', async (req, res) => {
  try {
    await processScreenshot(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Screenshot service running on port ${port}`);
}); 