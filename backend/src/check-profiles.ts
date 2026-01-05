import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.userProfile.count();
    console.log('Total profiles:', count);
}

check().finally(() => prisma.$disconnect());
