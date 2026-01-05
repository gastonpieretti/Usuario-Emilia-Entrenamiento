import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const exercises = await prisma.exercise.findMany();
    console.log(exercises.map(ex => ex.categoria));
}

check().finally(() => prisma.$disconnect());
