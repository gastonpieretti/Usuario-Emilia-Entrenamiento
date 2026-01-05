import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        console.log('Dropping possible defaults...');
        await client.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "orden_recomendado" DROP DEFAULT`);
        console.log('Converting to TEXT...');
        await client.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "orden_recomendado" TYPE TEXT`);
        console.log('Dropping type...');
        await client.$executeRawUnsafe(`DROP TYPE IF EXISTS "OrdenRecomendado" CASCADE`);
        console.log('Database Nuked and Fixed.');
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}
main().finally(() => client.$disconnect());
