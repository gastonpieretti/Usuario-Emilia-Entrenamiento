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
exports.createNewProgress = exports.getAllProgress = void 0;
const prisma_1 = require("../lib/prisma");
const getAllProgress = (role, userId, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    let whereClause = {};
    if (role === 'client') {
        whereClause = { userId };
    }
    else if (role === 'admin') {
        if (targetUserId) {
            whereClause = { userId: targetUserId };
        }
    }
    return prisma_1.prisma.progress.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true, email: true } } },
    });
});
exports.getAllProgress = getAllProgress;
const createNewProgress = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.progress.create({
        data: {
            userId,
            weight: Number(data.weight),
            waist: data.waist ? Number(data.waist) : null,
            legs: data.legs ? Number(data.legs) : null,
            hips: data.hips ? Number(data.hips) : null,
        },
    });
});
exports.createNewProgress = createNewProgress;
