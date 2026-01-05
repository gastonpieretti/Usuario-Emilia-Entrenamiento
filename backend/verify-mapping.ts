import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const exercises = await (prisma.exercise as any).findMany({
        where: {
            nombre: {
                in: [
                    'Sentadilla con Barra',
                    'Sentadilla en Máquina Smith',
                    'Prensa de Piernas',
                    'Sentadilla Hack'
                ]
            }
        },
        orderBy: { id: 'asc' }
    });
    console.log('--- VARIANT VERIFICATION ---');
    exercises.forEach((ex: any) => {
        console.log(`[${ex.id}] ${ex.nombre} | Variante ID: ${ex.idVariante}`);
    });
}
main().finally(() => prisma.$disconnect());
