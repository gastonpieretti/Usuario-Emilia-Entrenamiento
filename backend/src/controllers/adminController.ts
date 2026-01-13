import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // 1. Obtenemos los usuarios básicos
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' }
    });
    
    // 2. Obtenemos todos los perfiles de entrenamiento
    const profiles = await prisma.userProfile.findMany();

    // 3. Los unimos manualmente (así evitamos el error de nombres de relación)
    const usersWithProfiles = users.map(user => {
      const profile = profiles.find(p => p.userId === user.id);
      return {
        ...user,
        userProfile: profile || null
      };
    });
    
    return res.json(usersWithProfiles);
  } catch (error: any) {
    console.error('Error en Admin:', error.message);
    return res.status(500).json({ error: 'Error al cargar la lista de usuarios' });
  }
};
