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
        console.log('--- ROUTINES STATUS ---');
        const routines = yield prisma.routine.findMany({
            where: { userId: 11 },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isApproved: true,
                        hasCompletedOnboarding: true
                    }
                },
                exercises: true
            }
        });
        if (routines.length === 0) {
            console.log('No routines found for User ID 11.');
        }
        routines.forEach(r => {
            var _a;
            console.log(`ID: ${r.id} - User ID: ${r.userId} (${(_a = r.user) === null || _a === void 0 ? void 0 : _a.email}) - Day: ${r.weekDay} - Month: ${r.month} - Approved: ${r.isApproved} - Exercises: ${r.exercises.length}`);
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
