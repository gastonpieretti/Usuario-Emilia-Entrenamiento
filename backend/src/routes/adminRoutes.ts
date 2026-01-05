import { Router } from 'express';
import { approveUser, getPendingUsers, updateUserPlan } from '../controllers/adminController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/pending', isAuthenticated, isAdmin, getPendingUsers);
router.put('/:id/approve', isAuthenticated, isAdmin, approveUser);
router.put('/:id/plan', isAuthenticated, isAdmin, updateUserPlan);

export default router;
