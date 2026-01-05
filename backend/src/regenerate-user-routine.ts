import { generateOrchestratedRoutine } from './services/routineOrchestrator';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = 11;
    console.log(`--- REGENERATING ROUTINE FOR USER ${userId} ---`);

    // Check if user has profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user || !user.profile) {
        console.log('User or profile not found.');
        return;
    }

    const result = await generateOrchestratedRoutine(userId, 1);
    console.log('Regeneration Result:', JSON.stringify(result, null, 2));

    // Verify in DB
    const routines = await prisma.routine.findMany({
        where: { userId },
        include: { exercises: true }
    });

    routines.forEach(r => {
        console.log(`Day: ${r.weekDay} - Exercises: ${r.exercises.length}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
