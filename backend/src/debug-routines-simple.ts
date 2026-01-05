import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = 11;
    const routines = await prisma.routine.findMany({
        where: { userId },
        include: { exercises: true }
    });
    console.log(`--- Routines for User ${userId} ---`);
    routines.forEach(r => {
        console.log(`ID: ${r.id} | Month: ${r.month} | Day: ${r.weekDay} | Approved: ${r.isApproved} | Exercises: ${r.exercises.length}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
