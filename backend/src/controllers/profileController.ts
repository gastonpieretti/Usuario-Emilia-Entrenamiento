import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // --- LIMPIEZA DE DATOS PARA EVITAR ERRORES DE PRISMA ---
    
    // 1. Corregir dislikedFood (El error del log)
    // Si es un array, lo convertimos a texto simple.
    if (Array.isArray(data.dislikedFood)) {
      data.dislikedFood = data.dislikedFood.length > 0 ? data.dislikedFood.join(', ') : "";
    }

    // 2. Eliminar campos que el Frontend envía pero la Base de Datos no tiene
    delete data.isFinalStep;
    delete data.dailyActivity; 

    // 3. Asegurar que el ID sea un número válido
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    // --- GUARDADO EN BASE DE DATOS ---
    const profile = await prisma.userProfile.upsert({
      where: {
        userId: userId,
      },
      update: data,
      create: {
        ...data,
        userId: userId,
      },
    });

    console.log('Perfil guardado con éxito para usuario:', userId);
    return res.json(profile);

  } catch (error: any) {
    console.error('Error detallado en Prisma:', error.message);
    return res.status(500).json({ 
      error: 'Error al procesar el perfil',
      details: error.message 
    });
  }
};
