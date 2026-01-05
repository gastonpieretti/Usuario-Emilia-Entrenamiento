import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const exercises = [
    // --- WARMUPS ---
    { id: 401, nombre: 'Trote Suave', categoria: 'WARMUP', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1, patron_movimiento: 'LOCOMOCION' },
    { id: 402, nombre: 'Movilidad Dinámica', categoria: 'WARMUP', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'MOVILIDAD', fatiga_neuromuscular: 1, patron_movimiento: 'MOVILIDAD' },
    { id: 403, nombre: 'Saltos de Cuerda', categoria: 'WARMUP', nivel: 'INTERMEDIO', nivel_permitido: ['INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1, patron_movimiento: 'LOCOMOCION' },

    // --- PRINCIPALES (PIERNAS) ---
    { id: 1, nombre: 'Sentadilla Libre', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'PIERNAS', fatiga_neuromuscular: 3, patron_movimiento: 'EMPUJE_PIERNAS' },
    { id: 2, nombre: 'Sentadilla Goblet', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'CUADRICEPS', fatiga_neuromuscular: 2, patron_movimiento: 'EMPUJE_PIERNAS' },
    { id: 6, nombre: 'Peso Muerto Rumano', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['GIMNASIO'], equipamiento: ['BARRA', 'MANCUERNAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'ISQUIOS', fatiga_neuromuscular: 3, patron_movimiento: 'TRACCION_PIERNAS' },

    // --- PRINCIPALES (PUSH) ---
    { id: 101, nombre: 'Flexiones en Rodillas', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'PECHO', fatiga_neuromuscular: 2, patron_movimiento: 'EMPUJE_HORIZONTAL' },
    { id: 24, nombre: 'Press de Banca Mancuernas', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'PECHO', fatiga_neuromuscular: 2, patron_movimiento: 'EMPUJE_HORIZONTAL' },
    { id: 5, nombre: 'Press Militar Mancuernas', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'HOMBROS', fatiga_neuromuscular: 2, patron_movimiento: 'EMPUJE_VERTICAL' },

    // --- PRINCIPALES (PULL) ---
    { id: 26, nombre: 'Remo con Mancuerna', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'ESPALDA', fatiga_neuromuscular: 2, patron_movimiento: 'TRACCION_HORIZONTAL' },
    { id: 27, nombre: 'Jalón al Pecho', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['GIMNASIO'], equipamiento: ['MAQUINAS'], orden_recomendado: 'PRINCIPAL', grupo_muscular_primario: 'ESPALDA', fatiga_neuromuscular: 2, patron_movimiento: 'TRACCION_VERTICAL' },

    // --- COMPLEMENTARIOS ---
    { id: 7, nombre: 'Estocadas', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'CUADRICEPS', fatiga_neuromuscular: 2, patron_movimiento: 'EMPUJE_PIERNAS' },
    { id: 21, nombre: 'Curl Femoral Máquina', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MAQUINAS'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'ISQUIOS', fatiga_neuromuscular: 1, patron_movimiento: 'TRACCION_PIERNAS' },
    { id: 23, nombre: 'Elevación de Talones', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MAQUINAS', 'PESO_CORPORAL'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'PANTORRILLAS', fatiga_neuromuscular: 1, patron_movimiento: 'MOVILIDAD' },
    { id: 30, nombre: 'Puente de Glúteo', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'GLUTEOS', fatiga_neuromuscular: 1, patron_movimiento: 'TRACCION_PIERNAS' },
    { id: 8, nombre: 'Vuelos Laterales', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'HOMBROS', fatiga_neuromuscular: 1, patron_movimiento: 'ABDUCCION' },
    { id: 9, nombre: 'Curl de Biceps', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MANCUERNAS'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'BICEPS', fatiga_neuromuscular: 1, patron_movimiento: 'FLEXION_BRAZO' },
    { id: 10, nombre: 'Extensión de Triceps', categoria: 'FUERZA', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['GIMNASIO'], equipamiento: ['MAQUINAS', 'MANCUERNAS'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'TRICEPS', fatiga_neuromuscular: 1, patron_movimiento: 'EXTENSION_BRAZO' },

    // --- CORE ---
    { id: 301, nombre: 'Plancha Abdominal', categoria: 'CORE', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'CORE', fatiga_neuromuscular: 1, patron_movimiento: 'ANTI_EXTENSION' },
    { id: 13, nombre: 'Deadbug', categoria: 'CORE', nivel: 'PRINCIPIANTE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'COMPLEMENTARIO', grupo_muscular_primario: 'CORE', fatiga_neuromuscular: 1, patron_movimiento: 'ANTI_EXTENSION' }
];

async function main() {
    console.log('--- RAW SQL SEED PRO V1 ---');
    for (const ex of exercises) {
        try {
            await prisma.$executeRawUnsafe(`
                INSERT INTO "Exercise" (
                    id, nombre, categoria, nivel, lugar, equipamiento, 
                    orden_recomendado, grupo_muscular_primario, fatiga_neuromuscular, 
                    patron_movimiento, nivel_permitido, "urlVideoLoop", "instruccionesTecnicas", 
                    "seriesSugeridas", "repsSugeridas"
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) ON CONFLICT (id) DO UPDATE SET
                    nombre = EXCLUDED.nombre,
                    categoria = EXCLUDED.categoria,
                    nivel = EXCLUDED.nivel,
                    lugar = EXCLUDED.lugar,
                    equipamiento = EXCLUDED.equipamiento,
                    orden_recomendado = EXCLUDED.orden_recomendado,
                    grupo_muscular_primario = EXCLUDED.grupo_muscular_primario,
                    fatiga_neuromuscular = EXCLUDED.fatiga_neuromuscular,
                    patron_movimiento = EXCLUDED.patron_movimiento,
                    nivel_permitido = EXCLUDED.nivel_permitido
            `,
                ex.id, ex.nombre, ex.categoria, ex.nivel, ex.lugar, ex.equipamiento,
                ex.orden_recomendado, ex.grupo_muscular_primario, ex.fatiga_neuromuscular,
                ex.patron_movimiento, ex.nivel_permitido, '', '...', 3, '12'
            );
            console.log(`Seeded/Updated: ${ex.nombre}`);
        } catch (e: any) {
            console.error(`Failed ${ex.nombre}:`, e.message);
        }
    }
    console.log('Seed Complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
