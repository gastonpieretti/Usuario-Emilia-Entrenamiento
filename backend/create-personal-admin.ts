import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'gastonpieretti@gmail.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'admin',
            isApproved: true,
            hasCompletedOnboarding: true,
            passwordHash: hashedPassword
        },
        create: {
            email,
            name: 'Gaston',
            lastName: 'Pieretti',
            passwordHash: hashedPassword,
            role: 'admin',
            isApproved: true,
            hasCompletedOnboarding: true,
            securityQuestion: 'Ciudad donde naciste',
            securityAnswer: await bcrypt.hash('Miami', 10),
        },
    });

    console.log('--- ADMIN USER CONFIGURED ---');
    console.log(user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
