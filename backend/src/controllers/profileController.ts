import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const data = { ...req.body };

    // Limpieza de datos
    if (Array.isArray(data.dislikedFood)) {
      data.dislikedFood = data.dislikedFood.join(', ');
    }
    delete data.isFinalStep;
    delete data.dailyActivity;

    // 1. Guardar el Perfil (Usando el nombre correcto: 'profile')
    const profile = await prisma.userProfile.upsert({
      where: { userId: userId },
      update: data,
      create: { ...data, userId: userId },
    });

    // 2. ACTIVAR AL USUARIO (Vital para que aparezca en el Admin)
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true }
    });

    return res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Error al procesar perfil' });
  }
};
