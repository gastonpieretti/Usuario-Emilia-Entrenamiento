import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { notifyRoutineUpdate } from '../services/socket';

export const getRoutineHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { routineId } = req.params;
        const history = await (prisma as any).routineHistory.findMany({
            where: { routineId: Number(routineId) },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json(history);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Error fetching history' });
    }
};

export const getUserRoutineHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const history = await (prisma as any).routineHistory.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                routine: {
                    select: { title: true, weekDay: true }
                }
            }
        });
        res.json(history);
    } catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ error: 'Error fetching user history' });
    }
};

export const restoreRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { historyId } = req.params;
        const historyItem = await (prisma as any).routineHistory.findUnique({
            where: { id: Number(historyId) }
        });

        if (!historyItem) {
            return res.status(404).json({ error: 'History item not found' });
        }

        const snapshot = historyItem.data as any;

        // Atomic restoration
        await prisma.$transaction(async (tx) => {
            // 1. Delete current exercises
            await tx.routineExercise.deleteMany({
                where: { routineId: historyItem.routineId }
            });

            // 2. Upsert routine properties
            await tx.routine.upsert({
                where: { id: historyItem.routineId },
                update: {
                    title: snapshot.title,
                    description: snapshot.description,
                    weekDay: snapshot.weekDay,
                    order: snapshot.order
                } as any,
                create: {
                    id: historyItem.routineId,
                    userId: historyItem.userId,
                    title: snapshot.title,
                    description: snapshot.description,
                    weekDay: snapshot.weekDay,
                    order: snapshot.order
                } as any
            });

            // 3. Re-create exercises from snapshot
            if (snapshot.exercises && Array.isArray(snapshot.exercises)) {
                for (const ex of snapshot.exercises) {
                    await tx.routineExercise.create({
                        data: {
                            routineId: historyItem.routineId,
                            exerciseId: ex.exerciseId,
                            sets: ex.sets,
                            reps: ex.reps,
                            restTime: ex.restTime || '60s',
                            order: ex.order
                        } as any
                    });
                }
            }
        });

        notifyRoutineUpdate(historyItem.userId);
        res.json({ message: 'Routine restored successfully' });
    } catch (error) {
        console.error('Restore routine error:', error);
        res.status(500).json({ error: 'Error restoring routine' });
    }
};
