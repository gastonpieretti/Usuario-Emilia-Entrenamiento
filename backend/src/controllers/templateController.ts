import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { notifyRoutineUpdate } from '../services/socket';

export const getTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const templates = await (prisma as any).routineTemplate.findMany({
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Error fetching templates' });
    }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;
        const template = await (prisma as any).routineTemplate.create({
            data: { name, description }
        });
        res.json(template);
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: 'Error creating template' });
    }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updated = await (prisma as any).routineTemplate.update({
            where: { id: Number(id) },
            data: { name, description }
        });
        res.json(updated);
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: 'Error updating template' });
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await (prisma as any).routineTemplate.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Template deleted' });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ error: 'Error deleting template' });
    }
};

export const addExerciseToTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // templateId
        const { exerciseId, sets, reps, restTime } = req.body;

        const lastEx = await prisma.templateExercise.findFirst({
            where: { routineTemplateId: Number(id) },
            orderBy: { order: 'desc' }
        });

        const newOrder = lastEx ? lastEx.order + 1 : 0;

        const newTE = await (prisma as any).templateExercise.create({
            data: {
                routineTemplateId: Number(id),
                exerciseId: Number(exerciseId),
                sets: Number(sets) || 3,
                reps: String(reps) || '12',
                restTime: String(restTime) || '60s',
                order: newOrder
            },
            include: { exercise: true }
        });
        res.json(newTE);
    } catch (error) {
        console.error('Add exercise to template error:', error);
        res.status(500).json({ error: 'Error adding exercise to template' });
    }
};

export const removeExerciseFromTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { exerciseId } = req.params; // templateExerciseId
        await (prisma as any).templateExercise.delete({
            where: { id: Number(exerciseId) }
        });
        res.json({ message: 'Exercise removed from template' });
    } catch (error) {
        console.error('Remove exercise from template error:', error);
        res.status(500).json({ error: 'Error removing exercise from template' });
    }
};

export const updateTemplateExercise = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { sets, reps, restTime, order, exerciseId } = req.body;

        const updated = await (prisma as any).templateExercise.update({
            where: { id: Number(id) },
            data: {
                sets: sets !== undefined ? Number(sets) : undefined,
                reps: reps !== undefined ? String(reps) : undefined,
                restTime: restTime !== undefined ? String(restTime) : undefined,
                order: order !== undefined ? Number(order) : undefined,
                exerciseId: exerciseId !== undefined ? Number(exerciseId) : undefined
            },
            include: { exercise: true }
        });
        res.json(updated);
    } catch (error) {
        console.error('Update template exercise error:', error);
        res.status(500).json({ error: 'Error updating template exercise' });
    }
};

export const applyTemplateRoutine = async (req: AuthRequest, res: Response) => {
    try {
        const { templateId, userId, weekDay, title, mode } = req.body;

        const template = await (prisma as any).routineTemplate.findUnique({
            where: { id: Number(templateId) },
            include: { exercises: true }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check for existing routine on that day
        const existingRoutine = await prisma.routine.findFirst({
            where: {
                userId: Number(userId),
                weekDay: weekDay
            },
            include: { exercises: true }
        });

        if (existingRoutine && !mode) {
            return res.status(409).json({
                error: 'CONFLICT',
                message: 'Ya existe una rutina para este día. ¿Deseas REEMPLAZAR o SUMAR los ejercicios a la actual?'
            });
        }

        let routineId: number;

        if (existingRoutine && mode === 'replace') {
            // Delete existing exercises or the whole routine?
            // Re-using the routine object is cleaner for the frontend.
            await prisma.routineExercise.deleteMany({
                where: { routineId: existingRoutine.id }
            });
            routineId = existingRoutine.id;

            // Update title if provided
            if (title) {
                await prisma.routine.update({
                    where: { id: routineId },
                    data: { title }
                });
            }
        } else if (existingRoutine && mode === 'add') {
            routineId = existingRoutine.id;
        } else {
            // Create new routine
            const lastRoutine = await prisma.routine.findFirst({
                where: { userId: Number(userId) },
                orderBy: { order: 'desc' } as any
            });
            const newOrder = lastRoutine ? (lastRoutine as any).order + 1 : 0;

            const newRoutine = await prisma.routine.create({
                data: {
                    userId: Number(userId),
                    title: title || template.name,
                    weekDay: weekDay || 'Monday',
                    order: newOrder
                } as any
            });
            routineId = newRoutine.id;
        }

        // Get max order if adding
        let currentMaxOrder = -1;
        if (mode === 'add' && existingRoutine) {
            const lastEx = await prisma.routineExercise.findFirst({
                where: { routineId },
                orderBy: { order: 'desc' }
            });
            currentMaxOrder = lastEx ? lastEx.order : -1;
        }

        // Create the routine exercises
        await Promise.all(template.exercises.map((te: any, idx: number) => {
            return prisma.routineExercise.create({
                data: {
                    routineId: routineId,
                    exerciseId: te.exerciseId,
                    sets: te.sets,
                    reps: te.reps,
                    restTime: te.restTime,
                    order: currentMaxOrder + 1 + idx
                }
            });
        }));

        const finalRoutine = await prisma.routine.findUnique({
            where: { id: routineId },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        notifyRoutineUpdate(Number(userId));
        res.json(finalRoutine);
    } catch (error) {
        console.error('Apply template error:', error);
        res.status(500).json({ error: 'Error applying template to user' });
    }
};
