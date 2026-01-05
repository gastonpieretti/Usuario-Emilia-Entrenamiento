import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const exercises = await prisma.exercise.findMany();
    const counts: Record<string, number> = {};

    exercises.forEach(ex => {
        const lugares = ex.lugar || ['AMBOS'];
        lugares.forEach(l => {
            const loc = l.toUpperCase().trim();
            counts[loc] = (counts[loc] || 0) + 1;
        });
    });

    console.log('Exercise counts by location:', counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
