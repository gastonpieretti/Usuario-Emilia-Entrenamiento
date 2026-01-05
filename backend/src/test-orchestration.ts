import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateOrchestratedRoutine } from './services/routineOrchestrator';

const prisma = new PrismaClient();

async function testOrchestration() {
    console.log('--- INICIO PRUEBA ORQUESTACIÓN CLIENTE TEST ---');

    const email = 'clientetest@fitness.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crear/Actualizar Usuario 'Cliente Test'
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name: 'Cliente',
            lastName: 'Test',
            passwordHash: hashedPassword,
            role: 'client',
            isApproved: true,
            hasCompletedOnboarding: true,
        },
        create: {
            email,
            name: 'Cliente',
            lastName: 'Test',
            passwordHash: hashedPassword,
            role: 'client',
            isApproved: true,
            hasCompletedOnboarding: true,
        }
    });

    console.log(`Usuario ${user.id} (${user.email}) configurado.`);

    // 2. Configurar Perfil (Nivel Intermedio, 4 días)
    await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
            experienceLevel: 'Intermedio',
            daysPerWeek: 4,
            goal: 'General'
        },
        create: {
            userId: user.id,
            experienceLevel: 'Intermedio',
            daysPerWeek: 4,
            goal: 'General'
        }
    });

    console.log('Perfil configurado: Nivel Intermedio, 4 días.');

    // 3. Ejecutar Orquestación
    console.log('Ejecutando generateOrchestratedRoutine...');
    await generateOrchestratedRoutine(user.id);

    // 4. Verificación
    const routines = await prisma.routine.findMany({
        where: { userId: user.id },
        include: {
            exercises: {
                include: { exercise: true }
                // order by is handled in the frontend, but we can log them
            }
        }
    });

    console.log(`\nRESULTADOS: Se generaron ${routines.length} rutinas.`);

    routines.forEach(r => {
        console.log(`\n> RUTINA: ${r.title} | DÍA: ${r.weekDay}`);
        r.exercises.forEach(re => {
            const ex = re.exercise;
            console.log(`  - [${ex.id}] ${ex.nombre} | ${re.sets} series x ${re.reps} reps`);
        });
    });

    console.log('\n--- FIN DE PRUEBA ---');
}

testOrchestration()
    .catch(e => console.error('Error en prueba:', e))
    .finally(() => prisma.$disconnect());
