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
exports.findAdvancedVariant = exports.applyProgression = void 0;
const prisma_1 = require("../lib/prisma");
/**
 * ProgressionEngine
 * Handles routine evolution month by month.
 */
const applyProgression = (month, routineExercises, goal, level) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[Progression] Aplicando reglas para Mes ${month}`);
    // MES 1: Adaptación (No cambios)
    if (month === 1)
        return routineExercises;
    // BLOQUEO TOTAL DE VARIACIONES EN PRINCIPIANTES (Professional Coaching V1)
    if (level === 'PRINCIPIANTE') {
        console.log('[Progression] Nivel PRINCIPIANTE detectado. Bloqueando variaciones.');
        return routineExercises;
    }
    let modifiedExercises = [...routineExercises];
    // MES 2: Volumen (+15% series)
    if (month === 2) {
        modifiedExercises = modifiedExercises.map(ex => {
            const newSets = Math.ceil((ex.sets || 3) * 1.15);
            return Object.assign(Object.assign({}, ex), { sets: newSets });
        });
    }
    // MES 3: Intensidad (Descanso -15%)
    if (month === 3) {
        modifiedExercises = modifiedExercises.map(ex => {
            const currentRest = parseInt(ex.restTime || '60');
            const newRest = Math.round(currentRest * 0.85);
            return Object.assign(Object.assign({}, ex), { restTime: `${newRest}s` });
        });
    }
    // MES 4: Densidad (Descanso -25%, Superseries)
    if (month === 4) {
        modifiedExercises = modifiedExercises.map(ex => {
            const currentRest = parseInt(ex.restTime || '60');
            const newRest = Math.round(currentRest * 0.75);
            return Object.assign(Object.assign({}, ex), { restTime: `${newRest}s`, isSuperset: true });
        });
    }
    return modifiedExercises;
});
exports.applyProgression = applyProgression;
/**
 * Helper to find advanced variants for Mes 3
 */
const findAdvancedVariant = (baseExercise, userLevel) => __awaiter(void 0, void 0, void 0, function* () {
    // Buscar ejercicio con mismo patron_movimiento y grupo_muscular_primario pero nivel superior
    // O simplemente uno diferente compatible para evitar estancamiento
    const candidates = yield prisma_1.prisma.exercise.findMany({
        where: {
            nombre: { not: baseExercise.nombre },
            categoria: baseExercise.categoria,
            nivel_permitido: { has: userLevel },
            // Agregaremos lógica de matching por tags o categorías en el futuro
        }
    });
    if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return baseExercise; // Fallback
});
exports.findAdvancedVariant = findAdvancedVariant;
