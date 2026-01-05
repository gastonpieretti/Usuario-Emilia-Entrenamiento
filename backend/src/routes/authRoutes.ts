import { Router } from 'express';
import { register, login, me, logout } from '../controllers/authController';
import { isAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.post('/logout', logout);

router.post(
    '/register',
    validate([
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').notEmpty().withMessage('Name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
    ]),
    register
);

router.post(
    '/login',
    validate([
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
    login
);

router.post('/recover/question', validate([
    body('email').isEmail().withMessage('Invalid email')
]),
    // We need to import getQuestion. For now, inline it or import from controller (which I need to update imports for)
    // Let's rely on importing from controller
    require('../controllers/authController').getQuestion
);

router.post('/recover/verify', validate([
    body('email').isEmail().withMessage('Invalid email'),
    body('answer').notEmpty().withMessage('Answer is required')
]),
    require('../controllers/authController').recover
);

router.post('/reset-password', validate([
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]),
    require('../controllers/authController').reset
);

router.get('/me', isAuthenticated, me);

export default router;
