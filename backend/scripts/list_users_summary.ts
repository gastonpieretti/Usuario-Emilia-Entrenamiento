
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.user.count();
    const lastThree = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
            id: true,
            email: true,
            role: true,
            isApproved: true,
            hasCompletedOnboarding: true,
            createdAt: true
        }
    });
    console.log('Total users:', total);
    console.log('Last 3 users:', JSON.stringify(lastThree, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
