import { Router } from 'express';
import { SessionService } from '../services/session.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const siteId = req.query.siteId as string | undefined;
    const sessions = await SessionService.getSessions(req, siteId);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const session = await SessionService.getSession(req, req.params.id);
    res.json(session);
  } catch (error: any) {
    if (error.message === 'Session not found') {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
