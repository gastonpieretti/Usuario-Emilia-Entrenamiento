"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function sync() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        console.log('--- INICIO SINCRONIZACIÓN MAESTRA ---');
        const jsonPath = path_1.default.join(__dirname, '../../database/ejercicios_maestros_normalizados.json');
        const data = JSON.parse(fs_1.default.readFileSync(jsonPath, 'utf8'));
        const exercices = data.ejercicios;
        for (const ex of exercices) {
            console.log(`Sincronizando: ${ex.nombre}`);
            // Map risks to backend fields
            const riesgoRodilla = ex.riesgos.rodilla || 'SEGURO';
            const riesgoColumna = ex.riesgos.columna || 'SEGURO';
            const riesgoHombro = ex.riesgos.hombro || 'SEGURO';
            // Map fatigue to numeric values for easier engine logic
            const fatigueMap = { 'BAJA': 1, 'MEDIA': 2, 'ALTA': 3 };
            const fatigaVal = fatigueMap[ex.fatiga_neuromuscular] || 1;
            yield prisma.exercise.upsert({
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
                    seriesSugeridas: ((_b = (_a = ex.dosis_dinamica) === null || _a === void 0 ? void 0 : _a.TONIFICAR) === null || _b === void 0 ? void 0 : _b.series) || 3,
                    repsSugeridas: ((_e = (_d = (_c = ex.dosis_dinamica) === null || _c === void 0 ? void 0 : _c.TONIFICAR) === null || _d === void 0 ? void 0 : _d.reps) === null || _e === void 0 ? void 0 : _e.toString()) || '12'
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
                    seriesSugeridas: ((_g = (_f = ex.dosis_dinamica) === null || _f === void 0 ? void 0 : _f.TONIFICAR) === null || _g === void 0 ? void 0 : _g.series) || 3,
                    repsSugeridas: ((_k = (_j = (_h = ex.dosis_dinamica) === null || _h === void 0 ? void 0 : _h.TONIFICAR) === null || _j === void 0 ? void 0 : _j.reps) === null || _k === void 0 ? void 0 : _k.toString()) || '12',
                }
            });
        }
        console.log('--- SINCRONIZACIÓN FINALIZADA ---');
    });
}
sync().catch(console.error).finally(() => prisma.$disconnect());
