import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Ruta para GUARDAR el perfil
router.put('/profile/:id', updateProfile);

// Ruta para VER el perfil (para que no le aparezca vacío al usuario)
router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(req.params.id) }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

export default router;
