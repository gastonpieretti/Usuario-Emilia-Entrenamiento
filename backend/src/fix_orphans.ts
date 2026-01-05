
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting DB integrity check...');

    try {
        // Delete RoutineHistory records where the referenced Routine does not exist
        // We use executeRawUnsafe because normally Prisma Client enforces relations, 
        // preventing us from easily "seeing" the invalid links via standard queries if the schema expects them to exist.
        const result = await prisma.$executeRawUnsafe(`
            DELETE FROM "RoutineHistory" 
            WHERE "routineId" NOT IN (SELECT id FROM "Routine");
        `);

        console.log(`Cleaned up orphaned RoutineHistory records. Count: ${result}`);
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
