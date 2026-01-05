import { Router } from 'express';
import { getDiets, createDiet, updateDiet, deleteDiet } from '../controllers/dietController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', isAuthenticated, getDiets);
router.post(
    '/',
    isAuthenticated,
    isAdmin,
    validate([
        body('userId').isInt().withMessage('User ID must be an integer'),
        body('title').notEmpty().withMessage('Title is required'),
    ]),
    createDiet
);
router.put(
    '/:id',
    isAuthenticated,
    isAdmin,
    validate([
        body('title').optional().notEmpty(),
    ]),
    updateDiet
);
router.delete('/:id', isAuthenticated, isAdmin, deleteDiet);

export default router;
