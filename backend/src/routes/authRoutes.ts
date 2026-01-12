import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/authController';

const router = Router();

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUser);

// Estas rutas las dejamos comentadas para que no den error de "no existe"
// router.get('/me', me);
// router.post('/logout', logout);

export default router;
