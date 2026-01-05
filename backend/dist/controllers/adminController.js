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
exports.getPendingUsers = exports.approveUser = void 0;
const prisma_1 = require("../lib/prisma");
const emailService_1 = require("../services/emailService");
const approveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prisma_1.prisma.user.update({
            where: { id: Number(id) },
            data: { isApproved: true },
        });
        if (user.email && user.name) {
            yield (0, emailService_1.sendApprovalEmail)(user.email, user.name);
        }
        res.json({ message: 'User approved successfully', user });
    }
    catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Error approving user' });
    }
});
exports.approveUser = approveUser;
const getPendingUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany({
            where: {
                role: 'client',
                isApproved: false
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching pending users' });
    }
});
exports.getPendingUsers = getPendingUsers;
