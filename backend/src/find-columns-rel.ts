import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        const up = await client.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'UserProfile'`);
        console.log('UserProfile Columns:', up);
        const re = await client.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'RoutineExercise'`);
        console.log('RoutineExercise Columns:', re);
    } catch (e: any) {
        console.error('Error listing columns:', e.message);
    }
}
main().finally(() => client.$disconnect());
