import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS STATUS ---');
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    users.forEach(u => {
        console.log(`ID: ${u.id} - Email: ${u.email} - Approved: ${u.isApproved} - Onboarding: ${u.hasCompletedOnboarding} - Created: ${u.createdAt}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
