import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, isApproved: true, hasCompletedOnboarding: true }
    });
    console.log('--- USERS IN DB ---');
    console.log(users);
}
main().finally(() => prisma.$disconnect());
