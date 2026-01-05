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
exports.generateOrchestratedRoutine = void 0;
const prisma_1 = require("../lib/prisma");
const userService_1 = require("./userService");
/**
 * RoutineOrchestrator Agent
 * Responsible for generating strictly matched routines based on user profile and reference DB.
 */
const DAY_MAP = {
    1: ['Lunes'],
    2: ['Lunes', 'Jueves'],
    3: ['Lunes', 'Miércoles', 'Viernes'],
    4: ['Lunes', 'Martes', 'Jueves', 'Viernes'],
    5: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    6: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    7: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
};
const LEVEL_HIERARCHY = {
    'Principiante': ['Principiante'],
    'Intermedio': ['Principiante', 'Intermedio'],
    'Avanzado': ['Principiante', 'Intermedio', 'Avanzado'],
};
const generateOrchestratedRoutine = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // 0. Cleanup: Remove existing routines for this user to avoid duplicates on re-onboarding
    yield prisma_1.prisma.routineExercise.deleteMany({
        where: { routine: { userId } }
    });
    yield prisma_1.prisma.routine.deleteMany({
        where: { userId }
    });
    // 1. Get User Profile Data
    const user = yield (0, userService_1.getUserById)(userId);
    if (!user || !user.profile) {
        throw new Error('Perfil de usuario incompleto para orquestación.');
    }
    const { profile } = user;
    const userLevel = profile.experienceLevel || 'Principiante';
    const daysRequested = profile.daysPerWeek || 3;
    const userEquipment = profile.equipment || []; // e.g. ["Mancuernas", "Barra"]
    // 2. Fetch Master Exercise Database
    const masterExercises = yield prisma_1.prisma.exercise.findMany();
    // 3. APPLY STRICT MATCH FILTERING
    const allowedLevels = LEVEL_HIERARCHY[userLevel] || ['Principiante'];
    let filteredExercises = masterExercises.filter((ex) => {
        // Rule 1: Level Match (Strict)
        if (!allowedLevels.includes(ex.nivel))
            return false;
        return true;
    });
    if (filteredExercises.length === 0) {
        throw new Error('Ups! No encontramos ejercicios exactos para tu nivel en este momento. No te preocupes, Emilia revisará tu perfil personalmente para asignarte una rutina a medida.');
    }
    // 4. Organize by Days
    const sessionDays = DAY_MAP[daysRequested] || DAY_MAP[3];
    const generatedRoutines = [];
    for (const day of sessionDays) {
        // Select exercises for a balanced session (1 Empuje, 1 Tracción, 1 Leg + extras)
        const empuje = filteredExercises.filter((e) => e.categoria === 'Empuje');
        const traccion = filteredExercises.filter((e) => e.categoria === 'Tracción');
        const leg = filteredExercises.filter((e) => e.categoria === 'Leg');
        // Simple selection logic for the agent
        const sessionExercises = [
            ...getRandomItems(empuje, 2),
            ...getRandomItems(traccion, 2),
            ...getRandomItems(leg, 2),
        ].filter(Boolean);
        // 5. Create Routine in DB
        const routine = yield prisma_1.prisma.routine.create({
            data: {
                userId,
                title: `Plan Orquestado - ${day}`,
                description: `Rutina generada automáticamente para nivel ${userLevel} con objetivo ${profile.goal || 'General'}.`,
                weekDay: day,
                order: generatedRoutines.length // Assign sequential order
            }
        });
        // 6. Connect Exercises with suggested Sets/Reps
        for (let i = 0; i < sessionExercises.length; i++) {
            const ex = sessionExercises[i];
            yield prisma_1.prisma.routineExercise.create({
                data: {
                    routineId: routine.id,
                    exerciseId: ex.id,
                    sets: ex.seriesSugeridas || 3,
                    reps: ex.repsSugeridas || '10-12',
                    restTime: '90s',
                    order: i + 1
                }
            });
        }
        generatedRoutines.push(routine);
    }
    return generatedRoutines;
});
exports.generateOrchestratedRoutine = generateOrchestratedRoutine;
// Helper: Get N random items from array
function getRandomItems(arr, n) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
