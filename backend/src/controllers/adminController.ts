import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista Maestra: Ver a TODOS los usuarios (PUNTO 1)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: { profile: true }, // Trae los datos físicos y de nutrición
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al cargar la lista maestra' });
  }
};

// Bandeja de Entrada: Solo pendientes (PUNTO 1 - APROBACIONES)
export const getPendingData = async (req: Request, res: Response) => {
  try {
    const pendingAccounts = await prisma.user.findMany({
      where: { isApproved: false, hasCompletedOnboarding: true, isDeleted: false },
      include: { profile: true }
    });
    const pendingRoutines = await prisma.routine.findMany({
      where: { isApproved: false },
      include: { user: true }
    });
    res.json({ pendingAccounts, pendingRoutines });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al cargar pendientes' });
  }
};

// Botón de Aprobar
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isApproved: true }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al aprobar usuario' });
  }
};
