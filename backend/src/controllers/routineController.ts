import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateOrchestratedRoutine } from '../services/routineOrchestrator';
import { prisma } from '../lib/prisma';
import { notifyRoutineUpdate } from '../services/socket';

export const generateRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.body.userId) || req.user?.userId; // Admin can generate for others
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const routines = await generateOrchestratedRoutine(userId);
        res.json(routines);
    } catch (error: any) {
        console.error('Routine gen error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getRoutines = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.query.userId) || req.user?.userId;
        const requestingUserRole = req.user?.role;

        // Build where clause
        const whereClause: any = { userId };

        // [SECURITY] If not admin, only show approved routines
        if (requestingUserRole !== 'admin') {
            whereClause.isApproved = true;
        }

        const routines = await prisma.routine.findMany({
            where: whereClause,
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Enforce strict chronological sort
        const dayOrder: any = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
        routines.sort((a, b) => (dayOrder[a.weekDay] || 99) - (dayOrder[b.weekDay] || 99));

        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching routines' });
    }
};

export const updateRoutineExercise = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { sets, reps, order, exerciseId } = req.body;

        const current = await prisma.routineExercise.findUnique({
            where: { id: Number(id) },
            include: { routine: true }
        });
        if (current) {
            await createRoutineSnapshot(current.routine.userId, current.routineId, 'modify');
        }

        const updated = await prisma.routineExercise.update({
            where: { id: Number(id) },
            data: {
                sets: sets !== undefined ? Number(sets) : undefined,
                reps: reps !== undefined ? String(reps) : undefined,
                order: order !== undefined ? Number(order) : undefined,
                exerciseId: exerciseId !== undefined ? Number(exerciseId) : undefined
            } as any
        });
        if (current) notifyRoutineUpdate(current.routine.userId);
        res.json(updated);
    } catch (error) {
        console.error('Update RE error:', error);
        res.status(500).json({ error: 'Error updating routine exercise' });
    }
};

export const deleteRoutineExercise = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.routineExercise.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Exercise removed from routine' });
    } catch (error) {
        console.error('Delete RE error:', error);
        res.status(500).json({ error: 'Error removing exercise from routine' });
    }
};

export const addRoutineExercise = async (req: AuthRequest, res: Response) => {
    try {
        const { routineId, exerciseId, sets, reps, restTime } = req.body;

        const lastExercise = await prisma.routineExercise.findFirst({
            where: { routineId: Number(routineId) },
            orderBy: { order: 'desc' }
        });

        const newOrder = lastExercise ? lastExercise.order + 1 : 0;

        const newRE = await prisma.routineExercise.create({
            data: {
                routineId: Number(routineId),
                exerciseId: Number(exerciseId),
                sets: Number(sets) || 3,
                reps: String(reps) || '12',
                restTime: String(restTime) || '60s',
                order: newOrder
            }
        });
        res.json(newRE);
    } catch (error) {
        console.error('Add RE error:', error);
        res.status(500).json({ error: 'Error adding exercise to routine' });
    }
};

export const getAllExercises = async (req: AuthRequest, res: Response) => {
    try {
        const exercises = await prisma.exercise.findMany({
            orderBy: { nombre: 'asc' }
        });
        res.json(exercises);
    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Error fetching exercises' });
    }
};

export const updateRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, weekDay, order } = req.body;

        const routine = await prisma.routine.findUnique({
            where: { id: Number(id) }
        });
        if (routine) {
            await createRoutineSnapshot(routine.userId, routine.id, 'modify');
        }

        const updated = await prisma.routine.update({
            where: { id: Number(id) },
            data: {
                title: title !== undefined ? String(title) : undefined,
                description: description !== undefined ? String(description) : undefined,
                weekDay: weekDay !== undefined ? String(weekDay) : undefined,
                order: order !== undefined ? Number(order) : undefined
            } as any
        });
        if (routine) notifyRoutineUpdate(routine.userId);
        res.json(updated);
    } catch (error) {
        console.error('Update routine error:', error);
        res.status(500).json({ error: 'Error updating routine' });
    }
};

export const deleteRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const routine = await prisma.routine.findUnique({
            where: { id: Number(id) },
            include: { exercises: true }
        });

        if (routine) {
            await createRoutineSnapshot(routine.userId, routine.id, 'delete');
        }

        // Delete all exercises first (cascade)
        await prisma.routineExercise.deleteMany({
            where: { routineId: Number(id) }
        });

        const deleted = await prisma.routine.delete({
            where: { id: Number(id) }
        });

        if (routine) notifyRoutineUpdate(routine.userId);
        res.json(deleted);
    } catch (error) {
        console.error('Delete routine error:', error);
        res.status(500).json({ error: 'Error deleting routine' });
    }
};

// Helper to create snapshot
export const createRoutineSnapshot = async (userId: number, routineId: number, changeType: string) => {
    try {
        const routine = await prisma.routine.findUnique({
            where: { id: routineId },
            include: { exercises: { include: { exercise: true } } }
        });

        if (!routine) return;

        await (prisma as any).routineHistory.create({
            data: {
                userId,
                routineId,
                changeType,
                data: JSON.parse(JSON.stringify(routine)) // Snapshot
            }
        });
    } catch (error) {
        console.error('Snapshot error:', error);
    }
};

export const createRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, weekDay, title } = req.body;

        if (!userId || !weekDay) {
            return res.status(400).json({ error: 'User ID and Week Day are required' });
        }

        // Get max order to append at end
        const lastRoutine = await (prisma as any).routine.findFirst({
            where: { userId: Number(userId) },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastRoutine ? lastRoutine.order + 1 : 0;

        const routine = await prisma.routine.create({
            data: {
                userId: Number(userId),
                weekDay,
                title: title || `Rutina ${weekDay}`,
                order: newOrder,
                description: 'Nueva rutina creada manualmente'
            } as any
        });

        notifyRoutineUpdate(Number(userId));
        res.json(routine);
    } catch (error) {
        console.error('Create routine error:', error);
        res.status(500).json({ error: 'Error creating routine' });
    }
};

export const duplicateRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const sourceRoutine = await prisma.routine.findUnique({
            where: { id: Number(id) },
            include: { exercises: true }
        });

        if (!sourceRoutine) return res.status(404).json({ error: 'Routine not found' });

        const lastRoutine = await (prisma as any).routine.findFirst({
            where: { userId: sourceRoutine.userId },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastRoutine ? lastRoutine.order + 1 : 0;

        const newRoutine = await prisma.routine.create({
            data: {
                userId: sourceRoutine.userId,
                weekDay: sourceRoutine.weekDay, // Same day initially (will show as duplicate)
                title: `${sourceRoutine.title} (Copia)`,
                description: sourceRoutine.description,
                order: newOrder,
                exercises: {
                    create: sourceRoutine.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                        reps: ex.reps,
                        restTime: ex.restTime,
                        order: ex.order
                    }))
                }
            } as any,
            include: { exercises: true }
        });

        notifyRoutineUpdate(sourceRoutine.userId);
        res.json(newRoutine);
    } catch (error) {
        console.error('Duplicate routine error:', error);
        res.status(500).json({ error: 'Error duplicating routine' });
    }
};

export const approveRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Routine ID or Month (if month, we need userId)
        const { userId, month } = req.body;

        if (month && userId) {
            // Approve all routines of a month
            await prisma.routine.updateMany({
                where: { userId: Number(userId), month: Number(month) },
                data: { isApproved: true }
            });
            notifyRoutineUpdate(Number(userId));
            return res.json({ message: `Routines for month ${month} approved` });
        }

        const updated = await prisma.routine.update({
            where: { id: Number(id) },
            data: { isApproved: true }
        });
        notifyRoutineUpdate(updated.userId);
        res.json(updated);
    } catch (error) {
        console.error('Approve routine error:', error);
        res.status(500).json({ error: 'Error approving routine' });
    }
};

export const denyRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.routine.delete({
            where: { id: Number(id) }
        });
        notifyRoutineUpdate(deleted.userId);
        res.json({ message: 'Routine rejected and removed' });
    } catch (error) {
        console.error('Deny routine error:', error);
        res.status(500).json({ error: 'Error denying routine' });
    }
};

export const getPendingRoutinesSummary = async (req: AuthRequest, res: Response) => {
    try {
        const pending = await prisma.routine.findMany({
            where: { isApproved: false },
            include: {
                user: {
                    select: { name: true, lastName: true, email: true }
                }
            },
            distinct: ['userId', 'month'],
            orderBy: { createdAt: 'desc' }
        });
        res.json(pending);
    } catch (error) {
        console.error('Get pending routines error:', error);
        res.status(500).json({ error: 'Error fetching pending routines' });
    }
};
