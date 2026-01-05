import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- SEARCHING COMPATIBLE EXERCISES (CASA + NINGUNO) ---');

    // In the orchestrator, we normalize these:
    // userLocation = "CASA"
    // userEquipment = []

    const allExercises = await prisma.exercise.findMany() as any[];

    const filtered = allExercises.filter(ex => {
        const ent = ex.contexto?.entorno?.toUpperCase() || 'AMBOS';
        const eq = ex.contexto?.equipamiento || 'none';

        const matchEnt = ent === 'AMBOS' || ent === 'CASA';
        const matchEq = eq === 'none';

        return matchEnt && matchEq;
    });

    console.log(`Found ${filtered.length} matching exercises.`);
    filtered.forEach(ex => {
        console.log(`- ${ex.nombre} [${ex.grupo_muscular_primario}]`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
