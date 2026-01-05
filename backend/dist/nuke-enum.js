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
const client = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Dropping possible defaults...');
            yield client.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "orden_recomendado" DROP DEFAULT`);
            console.log('Converting to TEXT...');
            yield client.$executeRawUnsafe(`ALTER TABLE "Exercise" ALTER COLUMN "orden_recomendado" TYPE TEXT`);
            console.log('Dropping type...');
            yield client.$executeRawUnsafe(`DROP TYPE IF EXISTS "OrdenRecomendado" CASCADE`);
            console.log('Database Nuked and Fixed.');
        }
        catch (e) {
            console.error('Error:', e.message);
        }
    });
}
main().finally(() => client.$disconnect());
