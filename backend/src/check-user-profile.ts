import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'gastonpieretti@gmail.com' },
        include: { profile: true }
    });
    console.log(JSON.stringify(user, null, 2));
}

check().finally(() => prisma.$disconnect());
