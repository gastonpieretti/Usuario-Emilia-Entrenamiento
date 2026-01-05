import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const profiles = await prisma.userProfile.findMany();
    console.log(JSON.stringify(profiles, null, 2));
}

check().finally(() => prisma.$disconnect());
