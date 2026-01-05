
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const allPending = await prisma.user.findMany({
        where: {
            role: 'client',
            isDeleted: false,
            OR: [
                { isApproved: false },
                { routines: { some: { isApproved: false } } }
            ]
        },
        include: {
            routines: {
                select: {
                    id: true,
                    isApproved: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    const pendingAccounts = allPending.filter(u => !u.isApproved && !u.hasCompletedOnboarding);
    const pendingRoutines = allPending.filter(u => u.hasCompletedOnboarding && (u.routines.some(r => !r.isApproved) || !u.isApproved));

    console.log('--- ALL PENDING ---');
    console.log(JSON.stringify(allPending, null, 2));
    console.log('--- PENDING ACCOUNTS ---');
    console.log(pendingAccounts.length);
    console.log('--- PENDING ROUTINES ---');
    console.log(pendingRoutines.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
