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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const warmups = [
    { id: 401, nombre: 'Trote Suave', categoria: 'WARMUP', tipo: 'CARDIO_SUAVE', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1, urlVideoLoop: "" },
    { id: 402, nombre: 'Movilidad Articular Dinámica', categoria: 'WARMUP', tipo: 'MOVILIDAD', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'MOVILIDAD', fatiga_neuromuscular: 1, urlVideoLoop: "" },
    { id: 403, nombre: 'Saltos de Cuerda Suaves', categoria: 'WARMUP', tipo: 'CARDIO_SUAVE', nivel_permitido: ['INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['CUERDA'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CARDIO', fatiga_neuromuscular: 1, urlVideoLoop: "" },
    { id: 404, nombre: 'Gato-Camello (Movilidad Columna)', categoria: 'WARMUP', tipo: 'MOVILIDAD', nivel_permitido: ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], lugar: ['CASA', 'GIMNASIO'], equipamiento: ['PESO_CORPORAL'], orden_recomendado: 'WARMUP', grupo_muscular_primario: 'CORE', fatiga_neuromuscular: 1, urlVideoLoop: "" }
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- UPDATING EXERCISES FOR V1 ---');
        // 1. Rename SECUNDARIO to COMPLEMENTARIO
        yield prisma.exercise.updateMany({
            where: { orden_recomendado: 'SECUNDARIO' },
            data: { orden_recomendado: 'COMPLEMENTARIO' }
        });
        console.log('Renamed SECUNDARIO to COMPLEMENTARIO.');
        // 2. Add Warmups
        for (const ex of warmups) {
            yield prisma.exercise.upsert({
                where: { id: ex.id },
                update: Object.assign(Object.assign({}, ex), { nivel: ex.nivel_permitido[0] }),
                create: Object.assign(Object.assign({}, ex), { nivel: ex.nivel_permitido[0], instruccionesTecnicas: '...', repsSugeridas: '...', seriesSugeridas: 1 })
            });
            console.log(`Upserted: ${ex.nombre}`);
        }
        // 3. Update CORE orden_recomendado (some might be COMPLEMENTARIO now but engine expects their own category or slot)
        // The structure says: PRINCIPAL, PRINCIPAL, COMPLEMENTARIO, COMPLEMENTARIO, CORE.
        // So CORE exercises should stay as COMPLEMENTARIO or CORE? 
        // In my previous seed I had CORE as SECUNDARIO. Let's make sure they are COMPLEMENTARIO.
        console.log('Update Complete.');
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
