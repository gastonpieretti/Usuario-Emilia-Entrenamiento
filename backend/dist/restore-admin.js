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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function restore() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = 'gastonpieretti@gmail.com';
        const password = 'Miami323';
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield prisma.user.upsert({
            where: { email },
            update: {
                passwordHash: hashedPassword,
                role: 'admin',
                isApproved: true,
                hasCompletedOnboarding: true
            },
            create: {
                email,
                name: 'Gaston',
                lastName: 'Pieretti',
                passwordHash: hashedPassword,
                role: 'admin',
                isApproved: true,
                hasCompletedOnboarding: true
            }
        });
        console.log('Primary admin restored.');
    });
}
restore().finally(() => prisma.$disconnect());
