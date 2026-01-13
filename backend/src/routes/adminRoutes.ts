import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController';

const router = Router();

// Esta es la ruta que tu panel de Admin busca para mostrarte la lista
router.get('/users', getAllUsers);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
