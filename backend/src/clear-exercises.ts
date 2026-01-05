import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        await client.routineExercise.deleteMany({});
        await client.templateExercise.deleteMany({});
        await client.exercise.deleteMany({});
        console.log('Exercises cleared.');
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}
main().finally(() => client.$disconnect());
