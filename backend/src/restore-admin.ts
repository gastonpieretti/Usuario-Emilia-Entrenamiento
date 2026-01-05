import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function restore() {
    const email = 'gastonpieretti@gmail.com';
    const password = 'Miami323';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: 'admin',
            isApproved: true,
            hasCompletedOnboarding: true
        },
        create: {
            email,
            name: 'Gaston',
            lastName: 'Pieretti',
            passwordHash: hashedPassword,
            role: 'admin',
            isApproved: true,
            hasCompletedOnboarding: true
        }
    });
    console.log('Primary admin restored.');
}

restore().finally(() => prisma.$disconnect());
