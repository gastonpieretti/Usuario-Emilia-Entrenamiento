import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const exercises = await prisma.exercise.findMany();
    console.log('Total exercises:', exercises.length);
    if (exercises.length > 0) {
        console.log('Sample exercise:', JSON.stringify(exercises[0], null, 2));
        console.log('Sample levels:', [...new Set(exercises.map(e => e.nivel))]);
        console.log('Sample categories:', [...new Set(exercises.map(e => e.categoria))]);
    }
}

check().finally(() => prisma.$disconnect());
