import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START DEBUG HISTORY ---');
    try {
        console.log('Attempting to fetch RoutineHistory with routine relation...');
        // @ts-ignore
        const history = await prisma.routineHistory.findMany({
            take: 1,
            include: {
                routine: {
                    select: { title: true, weekDay: true }
                }
            }
        });
        console.log('SUCCESS. Items found:', history.length);
        if (history.length > 0) {
            console.log('Sample item:', JSON.stringify(history[0], null, 2));
        }
    } catch (e: any) {
        console.error('PRISMA ERROR:', e);
        console.error('Message:', e.message);
    } finally {
        await prisma.$disconnect();
    }
    console.log('--- END DEBUG HISTORY ---');
}

main();
