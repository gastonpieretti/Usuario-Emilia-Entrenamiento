import { PrismaClient } from '@prisma/client';
import { generateOrchestratedRoutine } from './services/routineOrchestrator';

const prisma = new PrismaClient();

async function simulate() {
    console.log('--- INICIO SIMULACIÓN USUARIO 999 ---');

    // 1. Crear Usuario 999
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('dummy', 10);
    const user = await prisma.user.upsert({
        where: { id: 999, email: 'test999@fitness.com' },
        update: {
            passwordHash: hashedPassword,
            isApproved: true,
            hasCompletedOnboarding: true,
        },
        create: {
            id: 999,
            email: 'test999@fitness.com',
            name: 'Test',
            lastName: 'Simulation',
            passwordHash: hashedPassword,
            role: 'client',
            isApproved: true,
            hasCompletedOnboarding: true,
        }
    });

    // 2. Crear Perfil Principiante / 3 días / Ganar Masa
    await prisma.userProfile.upsert({
        where: { userId: 999 },
        update: {
            experienceLevel: 'Principiante',
            daysPerWeek: 3,
            goal: 'Ganar Masa'
        },
        create: {
            userId: 999,
            experienceLevel: 'Principiante',
            daysPerWeek: 3,
            goal: 'Ganar Masa'
        }
    });

    console.log('Usuario y Perfil 999 configurados.');

    // 2.5 Asegurar Ejercicios de Prueba
    const testExercises = [
        { nombre: "Empuje P1", categoria: "Empuje", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        { nombre: "Empuje P2", categoria: "Empuje", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        { nombre: "Traccion P1", categoria: "Tracción", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        { nombre: "Traccion P2", categoria: "Tracción", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        { nombre: "Leg P1", categoria: "Leg", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        { nombre: "Leg P2", categoria: "Leg", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
    ];

    for (const ex of testExercises) {
        await (prisma.exercise as any).upsert({
            where: { id: testExercises.indexOf(ex) + 100 },
            update: ex,
            create: { ...ex, id: testExercises.indexOf(ex) + 100 }
        });
    }
    console.log('Ejercicios de prueba (2/2/2) creados.');

    // 3. Ejecutar Orquestación
    console.log('Ejecutando generateOrchestratedRoutine(999)...');
    const routines = await generateOrchestratedRoutine(999);

    // 4. Verificar y Loguear
    const fullRoutines = await prisma.routine.findMany({
        where: { userId: 999 },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    console.log(`\nRESULTADOS: Se generaron ${fullRoutines.length} rutinas.`);

    fullRoutines.forEach(r => {
        console.log(`\n> RUTINA: ${r.title} | DÍA: ${r.weekDay}`);
        console.log(`  Ejercicios (${r.exercises.length}):`);

        let countEmpuje = 0;
        let countTraccion = 0;
        let countLeg = 0;

        r.exercises.forEach((re: any) => {
            const ex = re.exercise as any;
            console.log(`    - [${ex.nivel}] ${ex.nombre} (${ex.categoria}) | ${re.sets} series x ${re.reps} reps`);

            if (ex.categoria === 'Empuje') countEmpuje++;
            if (ex.categoria === 'Tracción') countTraccion++;
            if (ex.categoria === 'Leg') countLeg++;
        });

        console.log(`  BALANCE: Empuje: ${countEmpuje}, Tracción: ${countTraccion}, Leg: ${countLeg}`);
    });

    console.log('\n--- FIN SIMULACIÓN ---');
}

simulate()
    .catch(e => console.error('Error en simulación:', e))
    .finally(() => prisma.$disconnect());
