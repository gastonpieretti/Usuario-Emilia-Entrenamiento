import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const profile = await prisma.userProfile.findUnique({ where: { userId: 1 } });
    console.log('Profile found:', profile ? 'YES' : 'NO');
    if (profile) console.log(JSON.stringify(profile, null, 2));
}

check().finally(() => prisma.$disconnect());
