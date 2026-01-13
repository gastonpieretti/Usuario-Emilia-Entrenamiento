import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController';

const router = Router();

router.get('/users', getAllUsers);
router.get('/health', (req, res) => res.json({ status: 'ok' }));

export default router;
