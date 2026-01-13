import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPendingData = async (req: Request, res: Response) => {
  try {
    // Buscamos usuarios que terminaron onboarding pero no están aprobados
    const pendingAccounts = await prisma.user.findMany({
      where: { 
        isApproved: false, 
        hasCompletedOnboarding: true,
        isDeleted: false 
      },
      include: { profile: true }
    });

    // Rutinas pendientes (basado en tu schema)
    const pendingRoutines = await prisma.routine.findMany({
      where: { isApproved: false },
      include: { user: true }
    });

    res.json({ pendingAccounts, pendingRoutines });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isApproved: true }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
