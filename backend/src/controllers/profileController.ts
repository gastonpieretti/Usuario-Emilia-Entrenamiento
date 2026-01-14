import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const data = { ...req.body };

    // Limpieza de datos (Evita errores de formato)
    if (Array.isArray(data.dislikedFood)) {
      data.dislikedFood = data.dislikedFood.join(', ');
    }
    delete data.isFinalStep; 

    // 1. Guardar en UserProfile (PUNTO 2)
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: userId },
      update: data,
      create: { ...data, userId: userId },
    });

    // 2. Marcar Onboarding como COMPLETO (PUNTO 1)
    // Esto hace que el usuario aparezca en tu lista de administrador
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true }
    });

    res.json(updatedProfile);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el perfil' });
  }
};
