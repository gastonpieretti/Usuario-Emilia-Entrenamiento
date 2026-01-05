import { prisma } from '../lib/prisma';

/**
 * ProgressionEngine
 * Handles routine evolution month by month.
 */

export const applyProgression = async (month: number, routineExercises: any[], goal: string, level: string) => {
    console.log(`[Progression] Aplicando reglas para Mes ${month}`);

    // MES 1: Adaptación (No cambios)
    if (month === 1) return routineExercises;

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
            return { ...ex, sets: newSets };
        });
    }

    // MES 3: Intensidad (Descanso -15%)
    if (month === 3) {
        modifiedExercises = modifiedExercises.map(ex => {
            const currentRest = parseInt(ex.restTime || '60');
            const newRest = Math.round(currentRest * 0.85);
            return { ...ex, restTime: `${newRest}s` };
        });
    }

    // MES 4: Densidad (Descanso -25%, Superseries)
    if (month === 4) {
        modifiedExercises = modifiedExercises.map(ex => {
            const currentRest = parseInt(ex.restTime || '60');
            const newRest = Math.round(currentRest * 0.75);
            return { ...ex, restTime: `${newRest}s`, isSuperset: true };
        });
    }

    return modifiedExercises;
};

/**
 * Helper to find advanced variants for Mes 3
 */
export const findAdvancedVariant = async (baseExercise: any, userLevel: string) => {
    // Buscar ejercicio con mismo patron_movimiento y grupo_muscular_primario pero nivel superior
    // O simplemente uno diferente compatible para evitar estancamiento
    const candidates = await prisma.exercise.findMany({
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
};
