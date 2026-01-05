import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userId = 11;
    const routines = await prisma.routine.findMany({
        where: { userId },
    });

    const hardcodedDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    console.log('--- Encoding Comparison for User 11 ---');
    routines.forEach(r => {
        const dbDay = r.weekDay;
        const matches = hardcodedDays.find(h => h === dbDay);
        console.log(`DB Day: "${dbDay}" | Match found: ${!!matches}`);
        console.log(`DB Codes: ${[...dbDay].map(c => c.charCodeAt(0)).join(',')}`);

        const hMatch = hardcodedDays.find(h => h.trim().toUpperCase() === dbDay.trim().toUpperCase());
        if (hMatch) {
            console.log(`Hardcoded "${hMatch}" Codes: ${[...hMatch].map(c => c.charCodeAt(0)).join(',')}`);
        }
        console.log('---');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
