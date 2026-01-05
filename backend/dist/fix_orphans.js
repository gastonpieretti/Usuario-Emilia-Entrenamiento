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
        console.log('Starting DB integrity check...');
        try {
            // Delete RoutineHistory records where the referenced Routine does not exist
            // We use executeRawUnsafe because normally Prisma Client enforces relations, 
            // preventing us from easily "seeing" the invalid links via standard queries if the schema expects them to exist.
            const result = yield prisma.$executeRawUnsafe(`
            DELETE FROM "RoutineHistory" 
            WHERE "routineId" NOT IN (SELECT id FROM "Routine");
        `);
            console.log(`Cleaned up orphaned RoutineHistory records. Count: ${result}`);
        }
        catch (error) {
            console.error('Error during cleanup:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
