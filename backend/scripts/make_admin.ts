import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import * as bcrypt from 'bcrypt';

async function main() {
    const email = 'gastonpieretti@gmail.com';
    const password = 'Miami323';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'admin',
                passwordHash: hashedPassword,
                isApproved: true,
                hasCompletedOnboarding: true
            },
            create: {
                email,
                passwordHash: hashedPassword,
                name: 'Admin',
                lastName: 'User',
                role: 'admin',
                isApproved: true,
                hasCompletedOnboarding: true
            },
        });
        console.log(`User ${email} created/updated as admin.`);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
