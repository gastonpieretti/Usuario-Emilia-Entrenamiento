import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';

const router = Router();

// Esta es la ruta que necesita tu formulario de Onboarding
router.put('/profile/:id', updateProfile);

export default router;
