import express from 'express';
import { json } from 'express';
import { Session } from '@session-recorder/types';
import { addToQueue } from './queue';
import { processEvents } from './processor';

const app = express();
const port = process.env.PORT || 3001;

app.use(json({ limit: '5mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/collect', async (req, res) => {
  try {
    const session: Session = req.body;
    
    // Validate required fields
    if (!session.siteId || !session.id || !session.events) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process events (sanitize and format)
    const processedEvents = await processEvents(session.events);

    // Add to processing queue
    await addToQueue({
      ...session,
      events: processedEvents
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Collector running on port ${port}`);
});
