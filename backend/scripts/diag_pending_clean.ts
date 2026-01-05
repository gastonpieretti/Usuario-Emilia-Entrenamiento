
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
        }
    });

    const pendingAccounts = allPending.filter(u => !u.isApproved && !u.hasCompletedOnboarding);
    const pendingRoutines = allPending.filter(u => u.hasCompletedOnboarding && (u.routines.some(r => !r.isApproved) || !u.isApproved));

    console.log('--- RESULTS ---');
    console.log('Pending Accounts:', pendingAccounts.length);
    console.log('Pending Routines:', pendingRoutines.length);
    console.log('User IDs in pending routines:', pendingRoutines.map(u => u.id));
}

main().catch(console.error).finally(() => prisma.$disconnect());
