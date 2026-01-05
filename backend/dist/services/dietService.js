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
exports.deleteDietById = exports.updateDietById = exports.createNewDiet = exports.getAllDiets = void 0;
const prisma_1 = require("../lib/prisma");
const getAllDiets = (role, userId, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    let whereClause = {};
    if (role === 'client') {
        whereClause = { userId };
    }
    else if (role === 'admin') {
        if (targetUserId) {
            whereClause = { userId: targetUserId };
        }
    }
    return prisma_1.prisma.diet.findMany({
        where: whereClause,
        include: { user: { select: { name: true, email: true } } },
    });
});
exports.getAllDiets = getAllDiets;
const createNewDiet = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.diet.create({
        data: {
            userId: Number(data.userId),
            title: data.title,
            description: data.description,
        },
    });
});
exports.createNewDiet = createNewDiet;
const updateDietById = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.diet.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
        },
    });
});
exports.updateDietById = updateDietById;
const deleteDietById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.diet.delete({
        where: { id },
    });
});
exports.deleteDietById = deleteDietById;
