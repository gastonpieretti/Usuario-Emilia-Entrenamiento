import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- RAW EXERCISE INSPECTION ---');
    const ex = await prisma.exercise.findFirst();
    console.log('Sample Exercise:', JSON.stringify(ex, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
