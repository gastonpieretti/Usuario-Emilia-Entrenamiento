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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- SEARCHING COMPATIBLE EXERCISES (CASA + NINGUNO) ---');
        // In the orchestrator, we normalize these:
        // userLocation = "CASA"
        // userEquipment = []
        const allExercises = yield prisma.exercise.findMany();
        const filtered = allExercises.filter(ex => {
            var _a, _b, _c;
            const ent = ((_b = (_a = ex.contexto) === null || _a === void 0 ? void 0 : _a.entorno) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'AMBOS';
            const eq = ((_c = ex.contexto) === null || _c === void 0 ? void 0 : _c.equipamiento) || 'none';
            const matchEnt = ent === 'AMBOS' || ent === 'CASA';
            const matchEq = eq === 'none';
            return matchEnt && matchEq;
        });
        console.log(`Found ${filtered.length} matching exercises.`);
        filtered.forEach(ex => {
            console.log(`- ${ex.nombre} [${ex.grupo_muscular_primario}]`);
        });
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
