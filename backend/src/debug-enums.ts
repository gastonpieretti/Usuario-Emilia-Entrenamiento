import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        const colInfo = await client.$queryRawUnsafe(`
            SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'Exercise' AND column_name = 'orden_recomendado'
        `);
        console.log('Column Info:', colInfo);

        const constraints = await client.$queryRawUnsafe(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = '"Exercise"'::regclass;
        `);
        console.log('Constraints:', constraints);
    } catch (e: any) {
        console.error('Error debugging:', e.message);
    }
}
main().finally(() => client.$disconnect());
