import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        include: { profile: true }
    });
    users.forEach(u => {
        console.log(`U${u.id} | ${u.email} | Profile: ${u.profile ? u.profile.experienceLevel + ' / ' + u.profile.goal : 'NO'}`);
    });
}

check().finally(() => prisma.$disconnect());
