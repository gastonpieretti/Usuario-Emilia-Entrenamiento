import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';
import { isAuthenticated } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Aplicamos isAuthenticated para que el servidor acepte el token del frontend
router.put('/profile/:id', isAuthenticated, updateProfile);

router.get('/profile/:id', isAuthenticated, async (req: any, res) => {
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
