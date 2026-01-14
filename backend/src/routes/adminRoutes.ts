import { Router } from 'express';
import { getPendingData, getAllUsers, approveUser } from '../controllers/adminController';

const router = Router();
router.get('/pending', getPendingData); // Para Inicio y Aprobaciones
router.get('/users', getAllUsers);      // Para la sección USUARIOS
router.put('/:id/approve', approveUser); // Para el botón aprobar
export default router;
