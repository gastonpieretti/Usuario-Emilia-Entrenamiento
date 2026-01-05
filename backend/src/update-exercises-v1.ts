import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const warmups = [
    { id: 401, nombre: 'Trote Suave', categoria: 'WARMUP', tipo: 'CARDIO_SUAVE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1 },
    { id: 402, nombre: 'Movilidad Articular Dinámica', categoria: 'WARMUP', tipo: 'MOVILIDAD', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'MOVILIDAD', fatiga_neuromuscular: 1 },
    { id: 403, nombre: 'Saltos de Cuerda Suaves', categoria: 'WARMUP', tipo: 'CARDIO_SUAVE', nivel_permitido: ['INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['CUERDA'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1 },
    { id: 404, nombre: 'Gato-Camello (Movilidad Columna)', categoria: 'WARMUP', tipo: 'MOVILIDAD', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CORE', fatiga_neuromuscular: 1 }
];

async function main() {
    console.log('--- UPDATING EXERCISES FOR V1 ---');

    // 1. Rename SECUNDARIO to COMPLEMENTARIO
    await prisma.exercise.updateMany({
        where: { orden_recomendado: 'SECUNDARIO' },
        data: { orden_recomendado: 'COMPLEMENTARIO' }
    });
    console.log('Renamed SECUNDARIO to COMPLEMENTARIO.');

    // 2. Add Warmups
    for (const ex of warmups) {
        await prisma.exercise.upsert({
            where: { id: ex.id },
            update: { ...ex, nivel: ex.nivel_permitido[0] },
            create: { ...ex, nivel: ex.nivel_permitido[0], instruccionesTecnicas: '...', repsSugeridas: '...', seriesSugeridas: 1 }
        });
        console.log(`Upserted: ${ex.nombre}`);
    }

    // 3. Update CORE orden_recomendado (some might be COMPLEMENTARIO now but engine expects their own category or slot)
    // The structure says: PRINCIPAL, PRINCIPAL, COMPLEMENTARIO, COMPLEMENTARIO, CORE.
    // So CORE exercises should stay as COMPLEMENTARIO or CORE? 
    // In my previous seed I had CORE as SECUNDARIO. Let's make sure they are COMPLEMENTARIO.

    console.log('Update Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
