import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        const res = await client.$queryRawUnsafe(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE udt_name = 'OrdenRecomendado'
        `);
        console.log('Enum usages:', res);
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}
main().finally(() => client.$disconnect());
