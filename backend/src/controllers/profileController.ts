import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Corrección TS2345: Garantizamos el tipo string para el parser
    const userId = parseInt(String(id));
    const data = { ...req.body };

    if (Array.isArray(data.dislikedFood)) {
      data.dislikedFood = data.dislikedFood.join(', ');
    }
    delete data.isFinalStep; 

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: userId },
      update: data,
      create: { ...data, userId: userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true }
    });

    res.json(updatedProfile);
  } catch (error: any) {
    console.error('Error en profile:', error.message);
    res.status(500).json({ error: 'Error al guardar el perfil' });
  }
};
