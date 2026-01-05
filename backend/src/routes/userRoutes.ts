import { Router } from 'express';
import { getUsers, getUser, updateUser, updateProfile } from '../controllers/userController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.get('/', isAuthenticated, isAdmin, getUsers);
router.get('/trash', isAuthenticated, isAdmin, require('../controllers/userController').getTrash); // Specific path before :id
router.post('/:id/trash', isAuthenticated, isAdmin, require('../controllers/userController').moveToTrash);
router.post('/:id/restore', isAuthenticated, isAdmin, require('../controllers/userController').restoreFromTrash);
router.delete('/:id', isAuthenticated, isAdmin, require('../controllers/userController').deletePermanently);

router.get('/:id', isAuthenticated, isAdmin, getUser);
router.put(
    '/:id',
    isAuthenticated,
    isAdmin,
    validate([
        body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email'),
        body('role').optional({ nullable: true }).isIn(['client', 'admin']).withMessage('Invalid role'),
        body('height').optional({ nullable: true }).isNumeric().toFloat(),
        body('weight').optional({ nullable: true }).isNumeric().toFloat(),
        body('age').optional({ nullable: true }).isInt().toInt(),
        body('planExpiresAt').optional({ nullable: true }).isISO8601().toDate(),
    ]),
    updateUser
);

router.post('/profile', isAuthenticated, updateProfile);

export default router;
