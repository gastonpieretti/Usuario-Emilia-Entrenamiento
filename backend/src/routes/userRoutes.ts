import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.put('/profile/:id', updateProfile);

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
