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
const userService_1 = require("./services/userService");
const prisma_1 = require("./lib/prisma");
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Testing getUserById with ID 1...');
            // Find any user id first
            const anyUser = yield prisma_1.prisma.user.findFirst();
            if (!anyUser) {
                console.log('No users found to test.');
                return;
            }
            const user = yield (0, userService_1.getUserById)(anyUser.id);
            console.log('User found:', user);
        }
        catch (err) {
            console.error('Test failed with error:', err.message);
        }
    });
}
test().finally(() => prisma_1.prisma.$disconnect());
