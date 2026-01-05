import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        const results = await client.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
        console.log('User Columns:', results);
    } catch (e: any) {
        console.error('Error listing columns:', e.message);
    }
}
main().finally(() => client.$disconnect());
