import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function sync() {
    console.log('--- INICIO SINCRONIZACIÓN MAESTRA ---');
    const jsonPath = path.join(__dirname, '../../database/ejercicios_maestros_normalizados.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const exercices = data.ejercicios;

    for (const ex of exercices) {
        console.log(`Sincronizando: ${ex.nombre}`);

        // Map risks to backend fields
        const riesgoRodilla = ex.riesgos.rodilla || 'SEGURO';
        const riesgoColumna = ex.riesgos.columna || 'SEGURO';
        const riesgoHombro = ex.riesgos.hombro || 'SEGURO';

        // Map fatigue to numeric values for easier engine logic
        const fatigueMap: Record<string, number> = { 'BAJA': 1, 'MEDIA': 2, 'ALTA': 3 };
        const fatigaVal = fatigueMap[ex.fatiga_neuromuscular] || 1;

        await prisma.exercise.upsert({
            where: { id: parseInt(ex.exercise_id.replace('EX_', '')) },
            update: {
                nombre: ex.nombre,
                categoria: ex.categoria,
                nivel: ex.nivel_permitido[0],
                nivel_permitido: ex.nivel_permitido,
                impacto: ex.impacto,
                lugar: ex.lugar,
                equipamiento: ex.equipamiento,
                riesgo_rodilla: riesgoRodilla,
                riesgo_columna: riesgoColumna,
                riesgo_hombro: riesgoHombro,
                grupo_muscular_primario: ex.grupo_muscular_primario,
                patron_movimiento: ex.patron_movimiento,
                frecuencia_max_semanal: ex.frecuencia_max_semanal || 2,
                fatiga_neuromuscular: fatigaVal,
                orden_recomendado: ex.orden_recomendado || 'SECUNDARIO',
                urlVideoLoop: ex.video_url || '',
                instruccionesTecnicas: ex.instrucciones,
                seriesSugeridas: ex.dosis_dinamica?.TONIFICAR?.series || 3,
                repsSugeridas: ex.dosis_dinamica?.TONIFICAR?.reps?.toString() || '12'
            },
            create: {
                id: parseInt(ex.exercise_id.replace('EX_', '')),
                nombre: ex.nombre,
                categoria: ex.categoria,
                nivel: ex.nivel_permitido[0],
                nivel_permitido: ex.nivel_permitido,
                impacto: ex.impacto,
                lugar: ex.lugar,
                equipamiento: ex.equipamiento,
                riesgo_rodilla: riesgoRodilla,
                riesgo_columna: riesgoColumna,
                riesgo_hombro: riesgoHombro,
                grupo_muscular_primario: ex.grupo_muscular_primario,
                patron_movimiento: ex.patron_movimiento,
                frecuencia_max_semanal: ex.frecuencia_max_semanal || 2,
                fatiga_neuromuscular: fatigaVal,
                orden_recomendado: ex.orden_recomendado || 'SECUNDARIO',
                urlVideoLoop: ex.video_url || '',
                instruccionesTecnicas: ex.instrucciones,
                seriesSugeridas: ex.dosis_dinamica?.TONIFICAR?.series || 3,
                repsSugeridas: ex.dosis_dinamica?.TONIFICAR?.reps?.toString() || '12',
            }
        });
    }

    console.log('--- SINCRONIZACIÓN FINALIZADA ---');
}

sync().catch(console.error).finally(() => prisma.$disconnect());
