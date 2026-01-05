
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const lastUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { profile: true, routines: true }
    });
    console.log(JSON.stringify(lastUser, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
