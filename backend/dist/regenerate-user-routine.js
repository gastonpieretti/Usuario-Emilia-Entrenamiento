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
const routineOrchestrator_1 = require("./services/routineOrchestrator");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = 11;
        console.log(`--- REGENERATING ROUTINE FOR USER ${userId} ---`);
        // Check if user has profile
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });
        if (!user || !user.profile) {
            console.log('User or profile not found.');
            return;
        }
        const result = yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(userId, 1);
        console.log('Regeneration Result:', JSON.stringify(result, null, 2));
        // Verify in DB
        const routines = yield prisma.routine.findMany({
            where: { userId },
            include: { exercises: true }
        });
        routines.forEach(r => {
            console.log(`Day: ${r.weekDay} - Exercises: ${r.exercises.length}`);
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
