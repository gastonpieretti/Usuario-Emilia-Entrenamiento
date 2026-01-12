import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // O req.user.userId si usas token
    const data = req.body;
    
    // Eliminamos campos que sabemos que dan error
    delete data.painColumna; 
    delete data.dailyActivity;

    const profile = await prisma.userProfile.upsert({
      where: { userId: Number(id) },
      update: data,
      create: { ...data, userId: Number(id) }
    });
    
    res.json(profile);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando perfil' });
  }
};
