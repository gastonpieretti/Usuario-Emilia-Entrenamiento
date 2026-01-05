import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const exercises = await prisma.exercise.findMany();
    const dist = exercises.reduce((acc: any, curr: any) => {
        const key = `${curr.nivel} - ${curr.categoria}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    console.log(JSON.stringify(dist, null, 2));
}

check().finally(() => prisma.$disconnect());
