import { prisma } from '../lib/prisma';
import { getUserById } from './userService';
import { generateWeeklyBlueprint } from './routineBlueprintEngine';
import { applyProgression, findAdvancedVariant } from './progressionEngine';
import { generateNutritionPlan } from './nutritionPlanEngine';

/**
 * RoutineOrchestrator Agent
 * Uses BlueprintEngine for structure and ProgressionEngine for evolution.
 * Also triggers NutritionPlanEngine for a complete user plan.
 */

const DAY_NAME_MAP: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
};

export const generateOrchestratedRoutine = async (userId: number, monthsCount: number = 3) => {
    const fuzzyMatch = (a: any, b: any) => {
        if (!a || !b) return false;
        const s1 = String(a).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const s2 = String(b).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        return s1 === s2 || s1.includes(s2) || s2.includes(s1);
    };

    console.log(`[Orchestrator] Iniciando generación 90 días (${monthsCount} meses) para:`, userId);

    // 1. Obtener Perfil
    const user = await getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado.');
    if (!user.profile) throw new Error('Usuario sin perfil (onboarding incompleto).');

    const profile = user.profile as any;
    const userLevel = (profile.experienceLevel || 'PRINCIPIANTE').toUpperCase();
    const userGoal = profile.goal || 'TONIFICAR';
    const numDays = profile.daysPerWeek || 3;
    const userLocation = (profile.trainingLocation || 'GIMNASIO').toUpperCase();
    const userEquipment = (profile.equipment || []).map((e: string) => e.toUpperCase()).filter((e: string) => e !== 'NO TENGO NADA' && e !== 'NINGUNO');

    // 2. Limpiar rutinas y dietas previas
    console.log('[Orchestrator] Limpiando datos previos...');
    await prisma.routineExercise.deleteMany({ where: { routine: { userId } } });
    await prisma.routine.deleteMany({ where: { userId } });
    await prisma.diet.deleteMany({ where: { userId } });

    // 3. Generar Plan Nutricional (Contract 1.0 - Part 5)
    console.log('[Orchestrator] Generando Plan Nutricional...');
    const nutrition = generateNutritionPlan(
        profile.gender || "HOMBRE",
        profile.weight_kg || 70,
        profile.height_cm || 170,
        profile.age || 30,
        userGoal as any,
        numDays
    );

    await (prisma.diet as any).create({
        data: {
            userId,
            title: `Plan Nutricional - ${userGoal}`,
            description: `Plan orquestado automáticamente para objetivo ${userGoal}`,
            targetCalories: nutrition.calorias_objetivo,
            proteinG: nutrition.macros.proteinas_g,
            carbG: nutrition.macros.carbohidratos_g,
            fatG: nutrition.macros.grasas_g,
            mealsStructure: nutrition.estructura_diaria
        }
    });

    // 4. Generar Blueprint Semanal (Estructura de Foco)
    const { blueprint } = generateWeeklyBlueprint(numDays, userGoal, userLevel);
    console.log('[Orchestrator] Blueprint generado:', JSON.stringify(blueprint));

    // 5. Configuración de Fechas de Plan
    const effectiveStartDate = (user as any).planStartDate ? new Date((user as any).planStartDate) : new Date();
    const totalMonths = (user as any).acquiredMonths || monthsCount;

    console.log(`[Orchestrator] Fecha inicio plan: ${effectiveStartDate.toISOString()} | Meses: ${totalMonths}`);

    // 6. Obtener Pool de Ejercicios
    const allExercises = await prisma.exercise.findMany() as any[];

    // 6.1 Biometría para Seguridad (Protocolo Sobrepeso)
    const heightM = profile.height_cm / 100;
    const bmi = profile.weight_kg / (heightM * heightM);
    const apiOverweight = bmi >= 30;

    // Mapping Goal to Motor naming
    const motorGoal = userGoal === 'Grasa' || userGoal === 'quema_grasa' ? 'quema_grasa' : (userGoal === 'Músculo' ? 'hipertrofia' : 'salud');

    // FILTROS OBLIGATORIOS
    let pool = allExercises.filter(ex => {
        const targetLoc = userLocation;
        const userLevelNorm = userLevel;

        if (apiOverweight && !fuzzyMatch(ex.impacto || "ALTO", "BAJO")) return false;

        const exerciseEntorno = (ex.lugar && ex.lugar.length > 0) ? ex.lugar[0] : 'AMBOS';
        const isEntornoMatch = fuzzyMatch(exerciseEntorno, 'AMBOS') || fuzzyMatch(exerciseEntorno, targetLoc);
        if (!isEntornoMatch) return false;

        const exerciseEquip = ex.equipamiento || [];
        const userEquipNorm = userEquipment;

        if (exerciseEquip.length > 0 && !exerciseEquip.some((e: string) => ['NONE', 'NINGUNO'].includes(e.toUpperCase()))) {
            const hasEquip = userEquipNorm.some((uEq: string) => exerciseEquip.some((e: string) => fuzzyMatch(e, uEq)));
            if (!hasEquip) return false;
        }

        const pMov = ex.patron_movimiento || "";
        if (profile.painRodilla && fuzzyMatch(pMov, "SENTADILLA")) return false;
        if (profile.painColumna && (fuzzyMatch(pMov, "BISAGRA") || fuzzyMatch(ex.riesgo_columna || "", "ALTO"))) return false;
        if (profile.painHombro && fuzzyMatch(ex.riesgo_hombro || "", "ALTO")) return false;

        const levels = [...(ex.nivel_permitido || [])];
        if (ex.nivel) levels.push(ex.nivel);
        if (!levels.some((l: string) => fuzzyMatch(l, userLevelNorm))) return false;

        return true;
    });

    console.log(`[Orchestrator] Pool filtered: ${pool.length} exercises found`);

    const getDosing = (ex: any, level: string) => {
        if (level === 'PRINCIPIANTE' || level === 'principiante') {
            return { sets: 2, reps: '15', rest: '90s' };
        }
        if (level === 'INTERMEDIO' || level === 'intermedio') {
            return { sets: 3, reps: '12', rest: '60s' };
        }
        return { sets: 4, reps: '10', rest: '60s' };
    };

    let previousMonthExerciseIdsByDay: Record<number, number[]> = {};

    const FALLBACK_VARIANTS: Record<string, string[]> = {
        "Prensa": ["Sentadilla"],
        "Prensa Hack": ["Sentadilla Sumo"],
        "Hip Thrust": ["Puente de Glúteos"],
        "Press Militar": ["Press en Máquina"],
        "Remo Máquina": ["Remo con Banda"]
    };

    for (let m = 1; m <= totalMonths; m++) {
        console.log(`[Orchestrator] Generando Mes ${m}...`);

        // Calcular fecha activación: inicio + (m-1) * 30 días
        const activationDate = new Date(effectiveStartDate);
        activationDate.setDate(activationDate.getDate() + (m - 1) * 30);

        let currentMonthExerciseIdsByDay: Record<number, number[]> = {};

        for (let d = 0; d < blueprint.length; d++) {
            const dayBlueprint = blueprint[d];
            const dayName = DAY_NAME_MAP[dayBlueprint.dia] || `Día ${dayBlueprint.dia}`;

            const routine = await (prisma.routine as any).create({
                data: {
                    userId,
                    title: `Mes ${m} - ${dayName}`,
                    description: `Plan: ${userLevel} | ${userGoal}`,
                    weekDay: dayName,
                    order: dayBlueprint.dia,
                    month: m,
                    activationDate,
                    blueprint: dayBlueprint as any,
                    isApproved: false
                }
            });

            let selectedForDay: any[] = [];
            const prevIds = previousMonthExerciseIdsByDay[dayBlueprint.dia] || [];
            const muscleGroupsUsed: Record<string, number> = {};
            let lastPattern = '';

            // Lógica de Selección (Professional Coaching V1)
            // Usamos los enfoques del blueprint como slots
            for (const focalPointRaw of dayBlueprint.enfoque) {
                const focalPoint = focalPointRaw.toUpperCase();
                // Para principiantes, intentamos 2 ejercicios por enfoque si es posible para llegar a 6
                const countPerFocal = userLevel === 'PRINCIPIANTE' ? 2 : 1.5; // Aproximación

                for (let i = 0; i < (userLevel === 'PRINCIPIANTE' ? 2 : (focalPoint === 'CORE' ? 1 : 2)); i++) {
                    if (selectedForDay.length >= 6) break;

                    let candidates = pool.filter(ex => {
                        const muscle = ex.grupo_muscular_primario || '';
                        const nameLower = ex.nombre.toLowerCase();

                        // Matching focal point
                        if (fuzzyMatch(focalPoint, 'PIERNAS_MAQUINA')) return ['PIERNAS', 'CUADRICEPS', 'ISQUIOS', 'GLUTEOS', 'PANTORRILLAS'].some(m => fuzzyMatch(muscle, m)) && ex.equipamiento?.some((e: string) => fuzzyMatch(e, 'MAQUINAS'));
                        if (fuzzyMatch(focalPoint, 'CUADRICEPS')) return fuzzyMatch(muscle, 'CUADRICEPS');
                        if (fuzzyMatch(focalPoint, 'FEMORAL')) return fuzzyMatch(muscle, 'ISQUIOS');
                        if (fuzzyMatch(focalPoint, 'GLUTEOS')) return fuzzyMatch(muscle, 'GLUTEOS');
                        if (fuzzyMatch(focalPoint, 'ESPALDA_MAQUINA')) return fuzzyMatch(muscle, 'ESPALDA');
                        if (fuzzyMatch(focalPoint, 'PECHO_MAQUINA')) return fuzzyMatch(muscle, 'PECHO');
                        if (fuzzyMatch(focalPoint, 'HOMBRO_MAQUINA')) return fuzzyMatch(muscle, 'HOMBROS');
                        if (fuzzyMatch(focalPoint, 'BICEPS')) return fuzzyMatch(muscle, 'BICEPS');
                        if (fuzzyMatch(focalPoint, 'TRICEPS')) return fuzzyMatch(muscle, 'TRICEPS');

                        // Generic matching
                        if (fuzzyMatch(focalPoint, 'PIERNAS')) return ['PIERNAS', 'CUADRICEPS', 'ISQUIOS', 'GLUTEOS', 'PANTORRILLAS'].some(m => fuzzyMatch(muscle, m));
                        if (fuzzyMatch(focalPoint, 'PUSH')) return ['PECHO', 'HOMBROS', 'TRICEPS'].some(m => fuzzyMatch(muscle, m)) || nameLower.includes('press');
                        if (fuzzyMatch(focalPoint, 'PULL')) return ['ESPALDA', 'BICEPS', 'BRAZOS'].some(m => fuzzyMatch(muscle, m)) || nameLower.includes('remo');
                        if (fuzzyMatch(focalPoint, 'FULLBODY') || fuzzyMatch(focalPoint, 'FULLBODY_INTENSIVO')) return true;
                        if (fuzzyMatch(focalPoint, 'CORE')) return fuzzyMatch(muscle, 'CORE') || fuzzyMatch(ex.categoria, 'CORE');

                        return false;
                    });


                    // PRIORIZACIÓN: Coincidencia con objetivo_principal (Músculo/Grasa)
                    candidates.sort((a, b) => {
                        const aMatch = (motorGoal === 'quema_grasa' && a.objetivos?.apto_quema_grasa) || (motorGoal === 'hipertrofia' && a.objetivos?.principal === 'hipertrofia') ? 1 : 0;
                        const bMatch = (motorGoal === 'quema_grasa' && b.objetivos?.apto_quema_grasa) || (motorGoal === 'hipertrofia' && b.objetivos?.principal === 'hipertrofia') ? 1 : 0;
                        return bMatch - aMatch;
                    });

                    // Reglas Transversales
                    candidates = candidates.filter(ex => {
                        if (ex.grupo_muscular_primario && (muscleGroupsUsed[ex.grupo_muscular_primario] || 0) >= 2) return false;
                        if (ex.patron_movimiento && ex.patron_movimiento === lastPattern) return false;
                        if (selectedForDay.find(s => s.id === ex.id)) return false;
                        return true;
                    });


                    let selected = null;
                    const sameAsPrev = candidates.filter(ex => prevIds.includes(ex.id));

                    if (userLevel === 'PRINCIPIANTE' && sameAsPrev.length > 0) {
                        // Stick to the same exercise to avoid improvisation
                        selected = sameAsPrev[0];
                    } else if (candidates.length > 0) {
                        // Priorizar el primer candidato (que ahora está ordenado por objetivo)
                        selected = candidates[0];
                    }

                    // Fallback Logic
                    if (!selected && userLevel === 'PRINCIPIANTE') {
                        // Buscar en el map de fallbacks
                        const fallbackNames = Object.keys(FALLBACK_VARIANTS);
                        for (const fbName of fallbackNames) {
                            if (focalPoint.includes(fbName.toUpperCase())) {
                                const alternativeNames = FALLBACK_VARIANTS[fbName];
                                const fbCandidates = pool.filter(ex => alternativeNames.some(n => ex.nombre.includes(n)));
                                if (fbCandidates.length > 0) {
                                    selected = getRandomItems(fbCandidates, 1)[0];
                                    break;
                                }
                            }
                        }
                    }

                    if (selected) {
                        const dose = getDosing(selected, userLevel);
                        selectedForDay.push({
                            ...selected,
                            sets: dose.sets,
                            reps: dose.reps,
                            restTime: dose.rest
                        });
                        if (selected.grupo_muscular_primario) {
                            muscleGroupsUsed[selected.grupo_muscular_primario] = (muscleGroupsUsed[selected.grupo_muscular_primario] || 0) + 1;
                        }
                        if (selected.patron_movimiento) lastPattern = selected.patron_movimiento;
                    }
                }
            }

            // Aplicar Progresión (Ajustes de series, descansos, etc.)
            const progressiveExercises = await applyProgression(m, selectedForDay, userGoal, userLevel);
            currentMonthExerciseIdsByDay[dayBlueprint.dia] = progressiveExercises.map((ex: any) => ex.id);

            // Guardar Ejercicios de la Rutina
            for (let j = 0; j < progressiveExercises.length; j++) {
                const ex = progressiveExercises[j];
                await (prisma.routineExercise as any).create({
                    data: {
                        routineId: routine.id,
                        exerciseId: ex.id,
                        sets: ex.sets,
                        reps: ex.reps,
                        restTime: ex.restTime,
                        isSuperset: ex.isSuperset || false,
                        order: j
                    }
                });
            }
        }
        previousMonthExerciseIdsByDay = currentMonthExerciseIdsByDay;
    }

    // 7. Generar Contrato Técnico del Día 1 como prueba (Segmento de Contrato 1.0)
    const firstRoutine = await prisma.routine.findFirst({
        where: { userId, month: 1, order: 1 },
        include: { exercises: { include: { exercise: true } } }
    });

    console.log('[Orchestrator] Generación completa.');
    return firstRoutine ? formatRoutineToContract(firstRoutine, profile) : { success: true };
};

export const formatRoutineToContract = (routine: any, profile: any) => {
    // Proyección Temporal (Peso actual vs objetivo)
    const currentWeight = profile.weight_kg || 0;
    const targetWeight = profile.targetWeight || currentWeight;
    const weightDiff = Math.abs(currentWeight - targetWeight);

    // Asumimos pérdida de ~0.5kg/semana para quema_grasa o ganancia ~0.25kg para músculo
    const ratePerWeek = profile.goal === 'Grasa' || profile.goal === 'quema_grasa' ? 0.5 : 0.25;
    const weeksToGoal = ratePerWeek > 0 ? Math.ceil(weightDiff / ratePerWeek) : 0;

    const estimateDate = new Date();
    estimateDate.setDate(estimateDate.getDate() + (weeksToGoal * 7));

    const bloques = [
        {
            tipo: "fuerza_principal",
            titulo: "Bloque de Fuerza y Adaptación",
            ejercicios: routine.exercises
                .filter((re: any) => re.exercise.categoria !== 'CORE')
                .map((re: any) => ({
                    id_ejercicio: re.exerciseId,
                    nombre: re.exercise.nombre,
                    series: re.sets,
                    repeticiones: re.reps,
                    descanso_seg: parseInt(re.restTime) || 60,
                    rpe_objetivo: 8,
                    video_url: re.exercise.urlVideoLoop,
                    tecnica: re.exercise.instruccionesTecnicas
                }))
        },
        {
            tipo: "core",
            titulo: "Bloque de Estabilidad (Core)",
            ejercicios: routine.exercises
                .filter((re: any) => re.exercise.categoria === 'CORE')
                .map((re: any) => ({
                    id_ejercicio: re.exerciseId,
                    nombre: re.exercise.nombre,
                    series: re.sets,
                    repeticiones: re.reps,
                    descanso_seg: parseInt(re.restTime) || 60,
                    rpe_objetivo: 7,
                    video_url: re.exercise.urlVideoLoop,
                    tecnica: re.exercise.instruccionesTecnicas
                }))
        }
    ];

    return {
        id_rutina: routine.id,
        nombre: routine.title,
        fase: `Mes ${routine.month}`,
        bienvenida_motivacional: {
            titulo: "Nivel 1: Inicio Consciente",
            mensaje: "¡Felicidades por dar el primer paso! Esta rutina ha sido calibrada específicamente para tu nivel y objetivos."
        },
        proyeccion_temporal: {
            peso_actual: currentWeight,
            peso_objetivo: targetWeight,
            semanas_estimadas: weeksToGoal,
            fecha_cumplimiento: estimateDate.toISOString().split('T')[0]
        },
        bloques,
        progresion_programada: {
            tipo: "Carga Progresiva Lineal",
            incremento_sugerido: "2-5% cada 2 semanas",
            proximo_hito: "Semana 4: Evaluación de Volumen"
        },
        seguridad: {
            reglas_activas: [
                profile.aptoSobrepeso ? "Protocolo Bajo Impacto" : "Protocolo Estándar",
                profile.painRodilla ? "Protección de Articulación (Rodilla)" : null,
                profile.painColumna ? "Limitación de Carga Axial (Columna)" : null
            ].filter(Boolean) as string[]
        },
        feedback_usuario: {
            habilitar_rpe: true,
            habilitar_dolor: true,
            habilitar_cansancio: true
        }
    };
};

function getRandomItems(arr: any[], n: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
