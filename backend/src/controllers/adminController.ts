import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Buscamos todos los usuarios e incluimos su perfil de entrenamiento
    const users = await prisma.user.findMany({
      include: {
        userProfile: true // Esto trae las respuestas del formulario
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(users);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error.message);
    return res.status(500).json({ error: 'Error al cargar la lista de usuarios' });
  }
};
