"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper to check array intersection
const hasIntersection = (arr1, arr2) => {
    return arr1.some(item => arr2.includes(item));
};
/*
export const generateRoutineForUser = async (userId: number) => {
    const user = await getUserById(userId);
    if (!user || !user.profile) {
        throw new Error('User profile incomplete');
    }

    const profile = user.profile;

    // User constraints
    const userEquipment = profile.equipment || ['Bodyweight']; // Default if empty
    const userInjuries = profile.painAreas || [];
    const experienceLevel = profile.experienceLevel || 'Beginner';
    const daysPerWeek = profile.daysPerWeek || 3;

    // 1. Fetch all exercises
    const allExercises = await prisma.exercise.findMany();

    // 2. Filter exercises
    const validExercises = allExercises.filter(ex => {
        // Filter by Equipment: User must have AT LEAST ONE of the required equipment items for the exercise
        // Or if exercise is bodyweight, always allow.
        // const exerciseNeeds = ex.equipment;
        // const hasEquipment = exerciseNeeds.some(eq => userEquipment.includes(eq) || eq === 'Bodyweight');
        // if (!hasEquipment) return false;

        // Filter by Injuries: If exercise affects an injured area, exclude it
        // Note: seed uses 'Knee', 'LowerBack'. Profile uses flexible strings, we need to be careful.
        // For matching, let's normalize to lowercase.
        // const exerciseRisks = ex.injuriesToAvoid.map(s => s.toLowerCase());
        // const userPains = userInjuries.map((s: string) => s.toLowerCase());

        // Simple string matching. "dolor de rodilla" includes "rodilla" -> match "knee"?
        // Since we don't have perfect mapping, strict matching might fail.
        // Let's rely on exact matches or simple substring for now.
        // Assumption: Seed data uses English tags (Knee), Profile data might be Spanish or custom.
        // TODO: Map profile Spanish inputs to English tags or update seed to Spanish.
        // For now, let's assume direct text matches or minimal filtering to avoid over-exclusion.
        // Ideally we would map "Rodillas" -> "Knee".

        // Let's implement a basic blocker if there is a direct match in tags.
        // If user says "Knee" and exercise says "Knee", exclude.
        // const conflicts = userPains.some(pain => exerciseRisks.includes(pain));
        // if (conflicts) return false;

        // Filter by Difficulty (Optional rule: Beginners shouldn't get Advanced)
        // if (experienceLevel === 'Beginner' && ex.difficulty === 'Advanced') return false;

        return true;
    });

    if (validExercises.length === 0) {
        throw new Error('No valid exercises found matching criteria');
    }

    // 3. Define Split based on Days Per Week
    // 3 days: Full Body x3
    // 4 days: Upper / Lower / Upper / Lower
    // 5 days: Push / Pull / Legs / Upper / Lower

    // For MVP simplicity, let's do Full Body A/B or similar.
    // Let's create `daysPerWeek` routines.

    const routinesCreated = [];
    const days = ['Monday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday', 'Saturday', 'Sunday'].slice(0, daysPerWeek);

    for (let i = 0; i < daysPerWeek; i++) {
        const day = days[i];

        // Select exercises for this day (Full Body Mix)
        // 1 Chest, 1 Back, 1 Leg, 1 Shoulder, 1 Core, 1 Arms
        const selection = [
            // validExercises.find(e => e.muscleGroup === 'Legs'),
            // validExercises.find(e => e.muscleGroup === 'Chest'),
            // validExercises.find(e => e.muscleGroup === 'Back'),
            // validExercises.find(e => e.muscleGroup === 'Shoulders'),
            // validExercises.find(e => e.muscleGroup === 'Arms'),
            // validExercises.find(e => e.muscleGroup === 'Core'),
        ].filter(Boolean); // Remove undefined

        // Create Routine Record
        const routine = await prisma.routine.create({
            data: {
                userId,
                title: `Rutina Automática - ${day}`,
                description: `Rutina personalizada para objetivos de ${profile.goal || 'fitness'}.`,
                weekDay: day,
            },
        });

        // Create Routine Exercises
        for (const [index, ex] of selection.entries()) {
            if (!ex) continue;
            await prisma.routineExercise.create({
                data: {
                    routineId: routine.id,
                    exerciseId: ex.id,
                    sets: 3,
                    reps: '10-12',
                    restTime: '60s',
                    order: index + 1,
                },
            });
        }
        routinesCreated.push(routine);
    }

    return routinesCreated;
};
*/
