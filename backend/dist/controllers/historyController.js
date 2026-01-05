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
exports.restoreRoutine = exports.getUserRoutineHistory = exports.getRoutineHistory = void 0;
const prisma_1 = require("../lib/prisma");
const socket_1 = require("../services/socket");
const getRoutineHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routineId } = req.params;
        const history = yield prisma_1.prisma.routineHistory.findMany({
            where: { routineId: Number(routineId) },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json(history);
    }
    catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Error fetching history' });
    }
});
exports.getRoutineHistory = getRoutineHistory;
const getUserRoutineHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const history = yield prisma_1.prisma.routineHistory.findMany({
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
    }
    catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ error: 'Error fetching user history' });
    }
});
exports.getUserRoutineHistory = getUserRoutineHistory;
const restoreRoutine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { historyId } = req.params;
        const historyItem = yield prisma_1.prisma.routineHistory.findUnique({
            where: { id: Number(historyId) }
        });
        if (!historyItem) {
            return res.status(404).json({ error: 'History item not found' });
        }
        const snapshot = historyItem.data;
        // Atomic restoration
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Delete current exercises
            yield tx.routineExercise.deleteMany({
                where: { routineId: historyItem.routineId }
            });
            // 2. Upsert routine properties
            yield tx.routine.upsert({
                where: { id: historyItem.routineId },
                update: {
                    title: snapshot.title,
                    description: snapshot.description,
                    weekDay: snapshot.weekDay,
                    order: snapshot.order
                },
                create: {
                    id: historyItem.routineId,
                    userId: historyItem.userId,
                    title: snapshot.title,
                    description: snapshot.description,
                    weekDay: snapshot.weekDay,
                    order: snapshot.order
                }
            });
            // 3. Re-create exercises from snapshot
            if (snapshot.exercises && Array.isArray(snapshot.exercises)) {
                for (const ex of snapshot.exercises) {
                    yield tx.routineExercise.create({
                        data: {
                            routineId: historyItem.routineId,
                            exerciseId: ex.exerciseId,
                            sets: ex.sets,
                            reps: ex.reps,
                            restTime: ex.restTime || '60s',
                            order: ex.order
                        }
                    });
                }
            }
        }));
        (0, socket_1.notifyRoutineUpdate)(historyItem.userId);
        res.json({ message: 'Routine restored successfully' });
    }
    catch (error) {
        console.error('Restore routine error:', error);
        res.status(500).json({ error: 'Error restoring routine' });
    }
});
exports.restoreRoutine = restoreRoutine;
