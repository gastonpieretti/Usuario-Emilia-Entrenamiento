import { Router } from 'express';
import { getPendingData, approveUser } from '../controllers/adminController';

const router = Router();

// Esta es la ruta exacta que pide tu AdminDashboard
router.get('/pending', getPendingData);

// Esta es la ruta para el botón de APROBAR
router.put('/:id/approve', approveUser);

export default router;
