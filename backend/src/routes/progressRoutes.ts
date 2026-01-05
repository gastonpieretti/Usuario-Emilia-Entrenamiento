import { Router } from 'express';
import { getProgress, createProgress } from '../controllers/progressController';
import { isAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', isAuthenticated, getProgress);
router.post(
    '/',
    isAuthenticated,
    validate([
        body('weight').isNumeric().withMessage('Weight must be a number'),
        body('waist').optional().isNumeric(),
        body('legs').optional().isNumeric(),
        body('hips').optional().isNumeric(),
    ]),
    createProgress
);

export default router;
