import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
async function main() {
    try {
        await client.$executeRawUnsafe(`
            INSERT INTO "Exercise" (nombre, categoria, nivel, lugar, equipamiento, orden_recomendado, "urlVideoLoop", "instruccionesTecnicas", "seriesSugeridas", "repsSugeridas") 
            VALUES ('Raw Test', 'WARMUP', 'PRINCIPIANTE', ARRAY['CASA']::TEXT[], ARRAY['PESO_CORPORAL']::TEXT[], 'WARMUP', '', '', 1, '1')
        `);
        console.log('Raw insert successful.');
    } catch (e: any) {
        console.error('Raw insert failed:', e.message);
    }
}
main().finally(() => client.$disconnect());
