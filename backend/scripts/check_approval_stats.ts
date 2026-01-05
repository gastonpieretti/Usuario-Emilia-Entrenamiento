
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'newly_registered_test@example.com' }
    });
    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('Test user not found, checking all users isApproved status');
        const counts = await prisma.user.groupBy({
            by: ['isApproved'],
            _count: {
                id: true
            }
        });
        console.log('Approval stats:', counts);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
