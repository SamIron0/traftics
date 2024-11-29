import express from 'express';
import { processScreenshot } from './screenshot';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Error logging middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall
    },
    path: req.path,
    method: req.method,
    body: req.body
  });
  next(err);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const port = process.env.PORT || 3001;

app.post('/screenshot', async (req, res) => {
  try {
    console.log('Received screenshot request for session:', req.body.sessionId);
    await processScreenshot(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Screenshot endpoint error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        errno: (error as any).errno,
        syscall: (error as any).syscall
      } : error,
      body: req.body
    });
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