import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEARING HISTORY ---');
    try {
        await prisma.routineHistory.deleteMany({});
        console.log('SUCCESS: RoutineHistory table cleared.');
    } catch (e: any) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
