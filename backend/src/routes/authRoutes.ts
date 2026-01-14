import { Router } from 'express';
import { 
  loginUser, 
  registerUser, 
  getSecurityQuestion, 
  recoverPassword, 
  resetPassword 
} from '../controllers/authController';

const router = Router();

// --- RUTAS DE ACCESO (POST) ---

// Esta es la ruta que activa el botón "Ingresar"
router.post('/login', loginUser);

// Esta es la ruta que activa el botón de "Registrarse"
router.post('/register', registerUser);

// --- RUTAS DE SEGURIDAD Y RECUPERACIÓN ---

// Para obtener la pregunta de seguridad
router.get('/security-question', getSecurityQuestion);

// Para iniciar la recuperación
router.post('/recover-password', recoverPassword);

// Para el cambio final de contraseña
router.post('/reset-password', resetPassword);

export default router;
