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
            include: { exercises: true }
        });
        console.log(`--- Routines for User ${userId} ---`);
        routines.forEach(r => {
            console.log(`ID: ${r.id} | Month: ${r.month} | Day: ${r.weekDay} | Approved: ${r.isApproved} | Exercises: ${r.exercises.length}`);
        });
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
