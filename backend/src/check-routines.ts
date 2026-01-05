import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ROUTINES STATUS ---');
    const routines = await prisma.routine.findMany({
        where: { userId: 11 },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isApproved: true,
                    hasCompletedOnboarding: true
                }
            },
            exercises: true
        }
    });

    if (routines.length === 0) {
        console.log('No routines found for User ID 11.');
    }

    routines.forEach(r => {
        console.log(`ID: ${r.id} - User ID: ${r.userId} (${r.user?.email}) - Day: ${r.weekDay} - Month: ${r.month} - Approved: ${r.isApproved} - Exercises: ${r.exercises.length}`);
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
