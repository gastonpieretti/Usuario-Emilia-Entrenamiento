"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTemplateRoutine = exports.updateTemplateExercise = exports.removeExerciseFromTemplate = exports.addExerciseToTemplate = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prisma_1 = require("../lib/prisma");
const socket_1 = require("../services/socket");
const getTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = yield prisma_1.prisma.routineTemplate.findMany({
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(templates);
    }
    catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Error fetching templates' });
    }
});
exports.getTemplates = getTemplates;
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const template = yield prisma_1.prisma.routineTemplate.create({
            data: { name, description }
        });
        res.json(template);
    }
    catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: 'Error creating template' });
    }
});
exports.createTemplate = createTemplate;
const updateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updated = yield prisma_1.prisma.routineTemplate.update({
            where: { id: Number(id) },
            data: { name, description }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: 'Error updating template' });
    }
});
exports.updateTemplate = updateTemplate;
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.prisma.routineTemplate.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Template deleted' });
    }
    catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ error: 'Error deleting template' });
    }
});
exports.deleteTemplate = deleteTemplate;
const addExerciseToTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // templateId
        const { exerciseId, sets, reps, restTime } = req.body;
        const lastEx = yield prisma_1.prisma.templateExercise.findFirst({
            where: { routineTemplateId: Number(id) },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastEx ? lastEx.order + 1 : 0;
        const newTE = yield prisma_1.prisma.templateExercise.create({
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
    }
    catch (error) {
        console.error('Add exercise to template error:', error);
        res.status(500).json({ error: 'Error adding exercise to template' });
    }
});
exports.addExerciseToTemplate = addExerciseToTemplate;
const removeExerciseFromTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exerciseId } = req.params; // templateExerciseId
        yield prisma_1.prisma.templateExercise.delete({
            where: { id: Number(exerciseId) }
        });
        res.json({ message: 'Exercise removed from template' });
    }
    catch (error) {
        console.error('Remove exercise from template error:', error);
        res.status(500).json({ error: 'Error removing exercise from template' });
    }
});
exports.removeExerciseFromTemplate = removeExerciseFromTemplate;
const updateTemplateExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { sets, reps, restTime, order, exerciseId } = req.body;
        const updated = yield prisma_1.prisma.templateExercise.update({
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
    }
    catch (error) {
        console.error('Update template exercise error:', error);
        res.status(500).json({ error: 'Error updating template exercise' });
    }
});
exports.updateTemplateExercise = updateTemplateExercise;
const applyTemplateRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateId, userId, weekDay, title, mode } = req.body;
        const template = yield prisma_1.prisma.routineTemplate.findUnique({
            where: { id: Number(templateId) },
            include: { exercises: true }
        });
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        // Check for existing routine on that day
        const existingRoutine = yield prisma_1.prisma.routine.findFirst({
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
        let routineId;
        if (existingRoutine && mode === 'replace') {
            // Delete existing exercises or the whole routine?
            // Re-using the routine object is cleaner for the frontend.
            yield prisma_1.prisma.routineExercise.deleteMany({
                where: { routineId: existingRoutine.id }
            });
            routineId = existingRoutine.id;
            // Update title if provided
            if (title) {
                yield prisma_1.prisma.routine.update({
                    where: { id: routineId },
                    data: { title }
                });
            }
        }
        else if (existingRoutine && mode === 'add') {
            routineId = existingRoutine.id;
        }
        else {
            // Create new routine
            const lastRoutine = yield prisma_1.prisma.routine.findFirst({
                where: { userId: Number(userId) },
                orderBy: { order: 'desc' }
            });
            const newOrder = lastRoutine ? lastRoutine.order + 1 : 0;
            const newRoutine = yield prisma_1.prisma.routine.create({
                data: {
                    userId: Number(userId),
                    title: title || template.name,
                    weekDay: weekDay || 'Monday',
                    order: newOrder
                }
            });
            routineId = newRoutine.id;
        }
        // Get max order if adding
        let currentMaxOrder = -1;
        if (mode === 'add' && existingRoutine) {
            const lastEx = yield prisma_1.prisma.routineExercise.findFirst({
                where: { routineId },
                orderBy: { order: 'desc' }
            });
            currentMaxOrder = lastEx ? lastEx.order : -1;
        }
        // Create the routine exercises
        yield Promise.all(template.exercises.map((te, idx) => {
            return prisma_1.prisma.routineExercise.create({
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
        const finalRoutine = yield prisma_1.prisma.routine.findUnique({
            where: { id: routineId },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        (0, socket_1.notifyRoutineUpdate)(Number(userId));
        res.json(finalRoutine);
    }
    catch (error) {
        console.error('Apply template error:', error);
        res.status(500).json({ error: 'Error applying template to user' });
    }
});
exports.applyTemplateRoutine = applyTemplateRoutine;
