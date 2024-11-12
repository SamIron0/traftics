import { Router } from 'express';
import { WebsiteService } from '../services/website.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const website = await WebsiteService.createWebsite(req, req.body);
    res.status(201).json(website);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const websites = await WebsiteService.getWebsites(req);
    res.json(websites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const website = await WebsiteService.getWebsite(req, req.params.id);
    res.json(website);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const website = await WebsiteService.updateWebsite(req, req.params.id, req.body);
    res.json(website);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await WebsiteService.deleteWebsite(req, req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
