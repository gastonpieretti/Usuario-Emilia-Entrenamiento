import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendApprovalEmail } from '../services/emailService';

export const approveUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isApproved: true },
        });

        // (Routine approval logic removed as isApproved was removed from Routine model)

        if (user.email && user.name) {
            await sendApprovalEmail(user.email, user.name);
        }

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Error approving user' });
    }
};

export const getPendingUsers = async (req: Request, res: Response) => {
    try {
        const allPending = await prisma.user.findMany({
            where: {
                role: 'client',
                isDeleted: false,
                OR: [
                    { isApproved: false },
                    { routines: { some: { isApproved: false } } }
                ]
            },
            include: {
                routines: {
                    where: { isApproved: false },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Accounts that need registration approval (isApproved: false and no onboarding done)
        const pendingAccounts = allPending.filter(u => !u.isApproved && !u.hasCompletedOnboarding);

        // Users with pending routines (either they just finished onboarding OR they have unapproved routine days)
        const usersWithPendingRoutines = allPending.filter(u =>
            u.routines.length > 0 || (u.hasCompletedOnboarding && !u.isApproved)
        );

        res.json({
            pendingAccounts,
            pendingRoutines: usersWithPendingRoutines.map(u => ({
                id: u.id,
                name: u.name,
                lastName: u.lastName,
                email: u.email,
                onboardingDate: (u as any).updatedAt,
                isAccountApproved: u.isApproved,
                pendingRoutinesCount: u.routines.length
            }))
        });
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ error: 'Error fetching pending users' });
    }
};

export const updateUserPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { planStartDate, acquiredMonths, planSchedule } = req.body;

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                planStartDate: planStartDate ? new Date(planStartDate) : undefined,
                acquiredMonths: acquiredMonths ? Number(acquiredMonths) : undefined,
                planSchedule: planSchedule || undefined,
            },
        });

        // Recalcular activationDate para las rutinas existentes
        const routines = await prisma.routine.findMany({
            where: { userId: Number(id) }
        });

        for (const routine of routines) {
            let activationDate: Date | null = null;

            // Prioridad: planSchedule (Configuración explícita por mes)
            if (planSchedule && Array.isArray(planSchedule)) {
                const monthConfig = planSchedule.find((m: any) => m.month === routine.month);
                if (monthConfig && monthConfig.start) {
                    activationDate = new Date(monthConfig.start);
                }
            }

            // Fallback: planStartDate (Cálculo automático de 30 días)
            if (!activationDate && planStartDate) {
                activationDate = new Date(planStartDate);
                activationDate.setDate(activationDate.getDate() + (routine.month - 1) * 30);
            }

            if (activationDate) {
                await prisma.routine.update({
                    where: { id: routine.id },
                    data: { activationDate }
                });
            }
        }

        res.json({ message: 'Plan actualizado correctamente', user });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Error al actualizar el plan' });
    }
};
