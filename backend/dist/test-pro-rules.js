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
const routineOrchestrator_1 = require("./services/routineOrchestrator");
const prisma = new client_1.PrismaClient();
function testProRules() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- TESTING PRO RULES V1 (GASTON METHOD) ---');
        const testUserId = 9; // Client user from previous tests
        // 1. Generate 4 months of routines for ADELGAZAR
        console.log('Generating 4 months for ADELGAZAR...');
        yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(testUserId, 4);
        const routines = yield prisma.routine.findMany({
            where: { userId: testUserId },
            include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
            orderBy: [{ month: 'asc' }, { order: 'asc' }]
        });
        console.log(`Generated ${routines.length} routines.`);
        // 2. Verify Session 1 (Month 1, Day 1)
        const r1 = routines[0];
        console.log(`\nVerifying Routine: ${r1.title}`);
        const sequence = r1.exercises.map((re) => `${re.exercise.orden_recomendado}(${re.exercise.grupo_muscular_primario})`);
        console.log('Exercise Sequence:', sequence.join(' -> '));
        // Expected: WARMUP -> PRINCIPAL -> PRINCIPAL -> COMPLEMENTARIO -> COMPLEMENTARIO -> CORE (if day has core)
        if (sequence[0].startsWith('WARMUP')) {
            console.log('Warmup Rule: PASSED');
        }
        else {
            console.error('Warmup Rule: FAILED - First exercise must be WARMUP');
        }
        const goal = 'ADELGAZAR';
        const m1Ex = r1.exercises[1]; // First Principal
        console.log(`Month 1 Sets: ${m1Ex.sets}, Reps: ${m1Ex.reps}, Rest: ${m1Ex.restTime}`);
        if (m1Ex.sets === 3)
            console.log('Goal Volume (M1): PASSED');
        // 3. Verify Progression Month 2 (Volume Boost)
        const rMonth2 = routines.find((r) => r.month === 2 && r.order === r1.order);
        if (rMonth2) {
            const m2Ex = rMonth2.exercises[1];
            console.log(`Month 2 Sets: ${m2Ex.sets} (Expected > ${m1Ex.sets})`);
            if (m2Ex.sets > m1Ex.sets)
                console.log('Month 2 Progression: PASSED');
        }
        // 4. Verify Progression Month 3 (Rest Reduction)
        const rMonth3 = routines.find((r) => r.month === 3 && r.order === r1.order);
        if (rMonth3) {
            const m3Ex = rMonth3.exercises[1];
            console.log(`Month 3 Rest: ${m3Ex.restTime} (Expected < ${m1Ex.restTime})`);
            if (parseInt(m3Ex.restTime) < parseInt(m1Ex.restTime))
                console.log('Month 3 Progression: PASSED');
        }
        // 5. Verify Hard Blocks (Patterns)
        console.log('\nChecking Hard Blocks (Consecutive Patterns)...');
        let patternFailures = 0;
        for (const r of routines) {
            let lastPat = '';
            for (const re of r.exercises) {
                const pat = re.exercise.patron_movimiento;
                if (pat && pat === lastPat) {
                    console.error(`FAILURE in ${r.title}: Consecutive pattern ${pat}`);
                    patternFailures++;
                }
                lastPat = pat;
            }
        }
        if (patternFailures === 0)
            console.log('Pattern Rule: PASSED');
        console.log('\n--- TESTING COMPLETE ---');
    });
}
testProRules().catch(console.error).finally(() => prisma.$disconnect());
