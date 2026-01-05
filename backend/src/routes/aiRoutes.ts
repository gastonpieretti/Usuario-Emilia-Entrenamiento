import { Router } from 'express';
import { getMotivation } from '../controllers/aiController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Endpoint para obtener motivación emocional (protegido por auth TEMPORALMENTE DESHABILITADO PARA DEBUG)
router.post('/motivation', getMotivation);

export default router;
