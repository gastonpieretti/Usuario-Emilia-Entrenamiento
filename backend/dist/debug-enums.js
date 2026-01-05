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
            const colInfo = yield client.$queryRawUnsafe(`
            SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'Exercise' AND column_name = 'orden_recomendado'
        `);
            console.log('Column Info:', colInfo);
            const constraints = yield client.$queryRawUnsafe(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = '"Exercise"'::regclass;
        `);
            console.log('Constraints:', constraints);
        }
        catch (e) {
            console.error('Error debugging:', e.message);
        }
    });
}
main().finally(() => client.$disconnect());
