import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- USER PROFILE INSPECTION (ID: 11) ---');
    const user = await prisma.user.findUnique({
        where: { id: 11 },
        include: { profile: true }
    });

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log('User:', JSON.stringify(user, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
