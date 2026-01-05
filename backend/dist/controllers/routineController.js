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
exports.getPendingRoutinesSummary = exports.denyRoutine = exports.approveRoutine = exports.duplicateRoutine = exports.createRoutine = exports.createRoutineSnapshot = exports.deleteRoutine = exports.updateRoutine = exports.getAllExercises = exports.addRoutineExercise = exports.deleteRoutineExercise = exports.updateRoutineExercise = exports.getRoutines = exports.generateRoutine = void 0;
const routineOrchestrator_1 = require("../services/routineOrchestrator");
const prisma_1 = require("../lib/prisma");
const socket_1 = require("../services/socket");
const generateRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number(req.body.userId) || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); // Admin can generate for others
        if (!userId)
            return res.status(400).json({ error: 'User ID required' });
        const routines = yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(userId);
        res.json(routines);
    }
    catch (error) {
        console.error('Routine gen error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.generateRoutine = generateRoutine;
const getRoutines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = Number(req.query.userId) || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        const requestingUserRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        // Build where clause
        const whereClause = { userId };
        // [SECURITY] If not admin, only show approved routines
        if (requestingUserRole !== 'admin') {
            whereClause.isApproved = true;
        }
        const routines = yield prisma_1.prisma.routine.findMany({
            where: whereClause,
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        // Enforce strict chronological sort
        const dayOrder = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
        routines.sort((a, b) => (dayOrder[a.weekDay] || 99) - (dayOrder[b.weekDay] || 99));
        res.json(routines);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching routines' });
    }
});
exports.getRoutines = getRoutines;
const updateRoutineExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { sets, reps, order, exerciseId } = req.body;
        const current = yield prisma_1.prisma.routineExercise.findUnique({
            where: { id: Number(id) },
            include: { routine: true }
        });
        if (current) {
            yield (0, exports.createRoutineSnapshot)(current.routine.userId, current.routineId, 'modify');
        }
        const updated = yield prisma_1.prisma.routineExercise.update({
            where: { id: Number(id) },
            data: {
                sets: sets !== undefined ? Number(sets) : undefined,
                reps: reps !== undefined ? String(reps) : undefined,
                order: order !== undefined ? Number(order) : undefined,
                exerciseId: exerciseId !== undefined ? Number(exerciseId) : undefined
            }
        });
        if (current)
            (0, socket_1.notifyRoutineUpdate)(current.routine.userId);
        res.json(updated);
    }
    catch (error) {
        console.error('Update RE error:', error);
        res.status(500).json({ error: 'Error updating routine exercise' });
    }
});
exports.updateRoutineExercise = updateRoutineExercise;
const deleteRoutineExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.prisma.routineExercise.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Exercise removed from routine' });
    }
    catch (error) {
        console.error('Delete RE error:', error);
        res.status(500).json({ error: 'Error removing exercise from routine' });
    }
});
exports.deleteRoutineExercise = deleteRoutineExercise;
const addRoutineExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId, exerciseId, sets, reps, restTime } = req.body;
        const lastExercise = yield prisma_1.prisma.routineExercise.findFirst({
            where: { routineId: Number(routineId) },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastExercise ? lastExercise.order + 1 : 0;
        const newRE = yield prisma_1.prisma.routineExercise.create({
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
    }
    catch (error) {
        console.error('Add RE error:', error);
        res.status(500).json({ error: 'Error adding exercise to routine' });
    }
});
exports.addRoutineExercise = addRoutineExercise;
const getAllExercises = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exercises = yield prisma_1.prisma.exercise.findMany({
            orderBy: { nombre: 'asc' }
        });
        res.json(exercises);
    }
    catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({ error: 'Error fetching exercises' });
    }
});
exports.getAllExercises = getAllExercises;
const updateRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, weekDay, order } = req.body;
        const routine = yield prisma_1.prisma.routine.findUnique({
            where: { id: Number(id) }
        });
        if (routine) {
            yield (0, exports.createRoutineSnapshot)(routine.userId, routine.id, 'modify');
        }
        const updated = yield prisma_1.prisma.routine.update({
            where: { id: Number(id) },
            data: {
                title: title !== undefined ? String(title) : undefined,
                description: description !== undefined ? String(description) : undefined,
                weekDay: weekDay !== undefined ? String(weekDay) : undefined,
                order: order !== undefined ? Number(order) : undefined
            }
        });
        if (routine)
            (0, socket_1.notifyRoutineUpdate)(routine.userId);
        res.json(updated);
    }
    catch (error) {
        console.error('Update routine error:', error);
        res.status(500).json({ error: 'Error updating routine' });
    }
});
exports.updateRoutine = updateRoutine;
const deleteRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const routine = yield prisma_1.prisma.routine.findUnique({
            where: { id: Number(id) },
            include: { exercises: true }
        });
        if (routine) {
            yield (0, exports.createRoutineSnapshot)(routine.userId, routine.id, 'delete');
        }
        // Delete all exercises first (cascade)
        yield prisma_1.prisma.routineExercise.deleteMany({
            where: { routineId: Number(id) }
        });
        const deleted = yield prisma_1.prisma.routine.delete({
            where: { id: Number(id) }
        });
        if (routine)
            (0, socket_1.notifyRoutineUpdate)(routine.userId);
        res.json(deleted);
    }
    catch (error) {
        console.error('Delete routine error:', error);
        res.status(500).json({ error: 'Error deleting routine' });
    }
});
exports.deleteRoutine = deleteRoutine;
// Helper to create snapshot
const createRoutineSnapshot = (userId, routineId, changeType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routine = yield prisma_1.prisma.routine.findUnique({
            where: { id: routineId },
            include: { exercises: { include: { exercise: true } } }
        });
        if (!routine)
            return;
        yield prisma_1.prisma.routineHistory.create({
            data: {
                userId,
                routineId,
                changeType,
                data: JSON.parse(JSON.stringify(routine)) // Snapshot
            }
        });
    }
    catch (error) {
        console.error('Snapshot error:', error);
    }
});
exports.createRoutineSnapshot = createRoutineSnapshot;
const createRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, weekDay, title } = req.body;
        if (!userId || !weekDay) {
            return res.status(400).json({ error: 'User ID and Week Day are required' });
        }
        // Get max order to append at end
        const lastRoutine = yield prisma_1.prisma.routine.findFirst({
            where: { userId: Number(userId) },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastRoutine ? lastRoutine.order + 1 : 0;
        const routine = yield prisma_1.prisma.routine.create({
            data: {
                userId: Number(userId),
                weekDay,
                title: title || `Rutina ${weekDay}`,
                order: newOrder,
                description: 'Nueva rutina creada manualmente'
            }
        });
        (0, socket_1.notifyRoutineUpdate)(Number(userId));
        res.json(routine);
    }
    catch (error) {
        console.error('Create routine error:', error);
        res.status(500).json({ error: 'Error creating routine' });
    }
});
exports.createRoutine = createRoutine;
const duplicateRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const sourceRoutine = yield prisma_1.prisma.routine.findUnique({
            where: { id: Number(id) },
            include: { exercises: true }
        });
        if (!sourceRoutine)
            return res.status(404).json({ error: 'Routine not found' });
        const lastRoutine = yield prisma_1.prisma.routine.findFirst({
            where: { userId: sourceRoutine.userId },
            orderBy: { order: 'desc' }
        });
        const newOrder = lastRoutine ? lastRoutine.order + 1 : 0;
        const newRoutine = yield prisma_1.prisma.routine.create({
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
            },
            include: { exercises: true }
        });
        (0, socket_1.notifyRoutineUpdate)(sourceRoutine.userId);
        res.json(newRoutine);
    }
    catch (error) {
        console.error('Duplicate routine error:', error);
        res.status(500).json({ error: 'Error duplicating routine' });
    }
});
exports.duplicateRoutine = duplicateRoutine;
const approveRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Routine ID or Month (if month, we need userId)
        const { userId, month } = req.body;
        if (month && userId) {
            // Approve all routines of a month
            yield prisma_1.prisma.routine.updateMany({
                where: { userId: Number(userId), month: Number(month) },
                data: { isApproved: true }
            });
            (0, socket_1.notifyRoutineUpdate)(Number(userId));
            return res.json({ message: `Routines for month ${month} approved` });
        }
        const updated = yield prisma_1.prisma.routine.update({
            where: { id: Number(id) },
            data: { isApproved: true }
        });
        (0, socket_1.notifyRoutineUpdate)(updated.userId);
        res.json(updated);
    }
    catch (error) {
        console.error('Approve routine error:', error);
        res.status(500).json({ error: 'Error approving routine' });
    }
});
exports.approveRoutine = approveRoutine;
const denyRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield prisma_1.prisma.routine.delete({
            where: { id: Number(id) }
        });
        (0, socket_1.notifyRoutineUpdate)(deleted.userId);
        res.json({ message: 'Routine rejected and removed' });
    }
    catch (error) {
        console.error('Deny routine error:', error);
        res.status(500).json({ error: 'Error denying routine' });
    }
});
exports.denyRoutine = denyRoutine;
const getPendingRoutinesSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pending = yield prisma_1.prisma.routine.findMany({
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
    }
    catch (error) {
        console.error('Get pending routines error:', error);
        res.status(500).json({ error: 'Error fetching pending routines' });
    }
});
exports.getPendingRoutinesSummary = getPendingRoutinesSummary;
