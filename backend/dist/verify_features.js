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
const prisma_1 = require("./lib/prisma");
function verify() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- START VERIFICATION ---');
        // 1. Check if RoutineHistory model is accessible
        try {
            const count = yield prisma_1.prisma.routineHistory.count();
            console.log(`Current RoutineHistory count: ${count}`);
        }
        catch (e) {
            console.error('FAILED: RoutineHistory model not found or error', e.message);
        }
        // 2. Check if order field exists on Routine
        try {
            const routine = yield prisma_1.prisma.routine.findFirst();
            if (routine && 'order' in routine) {
                console.log('SUCCESS: order field exists on Routine');
            }
            else if (routine) {
                console.log('FAILED: order field MISSING on Routine');
            }
        }
        catch (e) {
            console.error('FAILED: Error checking Routine fields', e.message);
        }
        console.log('--- END VERIFICATION ---');
    });
}
verify().catch(console.error);
