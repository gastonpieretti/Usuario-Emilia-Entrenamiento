import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        OR: search ? [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
        ] : undefined
      },
      include: { 
        profile: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedUsers = users.map(user => ({
      ...user,
      fullName: `${user.name || ''} ${user.lastName || ''}`.trim(),
      status: user.isApproved ? 'Activo' : 'Pendiente',
      onboardingComplete: user.hasCompletedOnboarding
    }));

    return res.json(formattedUsers);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error.message);
    return res.status(500).json({ error: 'Error interno al cargar la lista de usuarios' });
  }
};

export const getPendingData = async (req: Request, res: Response) => {
  try {
    const pendingAccounts = await prisma.user.findMany({
      where: { 
        isApproved: false, 
        hasCompletedOnboarding: true,
        isDeleted: false 
      },
      include: { profile: true }
    });

    const pendingRoutines = await prisma.routine.findMany({
      where: { isApproved: false },
      include: { user: true }
    });

    return res.json({ 
      pendingAccounts, 
      pendingRoutines 
    });
  } catch (error: any) {
    console.error('Error al obtener pendientes:', error.message);
    return res.status(500).json({ error: 'Error al cargar datos pendientes' });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Corrección TS2345: Aseguramos que el id sea string antes de usarlo
    const userId = parseInt(String(id));

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true }
    });

    return res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error al aprobar usuario:', error.message);
    return res.status(500).json({ error: 'No se pudo aprobar al usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(String(id));
    
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true }
    });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
