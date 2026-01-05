import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        await client.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "orden_recomendado" TYPE TEXT`);
        console.log('Column converted to TEXT successfully.');
    } catch (e: any) {
        console.error('Error converting column:', e.message);
    }
}
main().finally(() => client.$disconnect());
