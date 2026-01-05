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
        const userId = 11;
        const routines = yield prisma.routine.findMany({
            where: { userId },
        });
        const hardcodedDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        console.log('--- Encoding Comparison for User 11 ---');
        routines.forEach(r => {
            const dbDay = r.weekDay;
            const matches = hardcodedDays.find(h => h === dbDay);
            console.log(`DB Day: "${dbDay}" | Match found: ${!!matches}`);
            console.log(`DB Codes: ${[...dbDay].map(c => c.charCodeAt(0)).join(',')}`);
            const hMatch = hardcodedDays.find(h => h.trim().toUpperCase() === dbDay.trim().toUpperCase());
            if (hMatch) {
                console.log(`Hardcoded "${hMatch}" Codes: ${[...hMatch].map(c => c.charCodeAt(0)).join(',')}`);
            }
            console.log('---');
        });
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
