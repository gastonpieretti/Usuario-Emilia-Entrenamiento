import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. LISTA MAESTRA (Para la sección "USUARIOS")
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
        profile: true // Incluye todos los datos del PUNTO 2 (peso, altura, etc.)
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Mapeamos los datos para que el panel de administración los entienda fácil
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

// 2. BANDEJA DE ENTRADA (Para la sección "APROBACIONES" e "INICIO")
export const getPendingData = async (req: Request, res: Response) => {
  try {
    // Buscamos usuarios que terminaron su registro pero no están aprobados aún
    const pendingAccounts = await prisma.user.findMany({
      where: { 
        isApproved: false, 
        hasCompletedOnboarding: true,
        isDeleted: false 
      },
      include: { profile: true }
    });

    // También traemos rutinas que el administrador deba revisar
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

// 3. ACCIÓN DE APROBACIÓN (El botón "APROBAR")
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true }
    });

    console.log(`Usuario ${userId} aprobado con éxito`);
    return res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error al aprobar usuario:', error.message);
    return res.status(500).json({ error: 'No se pudo aprobar al usuario' });
  }
};

// 4. ELIMINAR/CANCELAR (Para el botón de la papelera)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true }
    });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
