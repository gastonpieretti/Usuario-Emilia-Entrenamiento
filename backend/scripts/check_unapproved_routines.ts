
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const unapprovedRoutines = await prisma.routine.findMany({
        where: { isApproved: false },
        include: { user: true }
    });
    console.log('Unapproved Routines count:', unapprovedRoutines.length);
    const usersWithUnapprovedRoutines = [...new Set(unapprovedRoutines.map(r => r.userId))];
    console.log('Users with unapproved routines:', usersWithUnapprovedRoutines);
}

main().catch(console.error).finally(() => prisma.$disconnect());
