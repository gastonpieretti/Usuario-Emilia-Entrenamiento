import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
    const email = 'gastonpieretti@gmail.com';
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

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
            name: 'Gaston',
            lastName: 'Pieretti',
            role: 'admin',
            isApproved: true,
            hasCompletedOnboarding: true
        },
    });

    console.log(`User ${email} updated/created as admin with password: ${password}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
