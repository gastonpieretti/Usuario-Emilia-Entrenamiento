import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        const results = await client.$queryRawUnsafe(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE column_name = 'existe'
        `);
        console.log('Search Results for existe:', results);
    } catch (e: any) {
        console.error('Error searching:', e.message);
    }
}
main().finally(() => client.$disconnect());
