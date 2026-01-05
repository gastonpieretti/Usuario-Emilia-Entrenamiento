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
exports.getUnreadCount = exports.markAsRead = exports.getMessages = exports.sendMessage = void 0;
const prisma_1 = require("../lib/prisma");
// Send Message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { receiverId, content } = req.body;
        if (!senderId)
            return res.status(401).json({ error: 'Unauthorized' });
        const message = yield prisma_1.prisma.message.create({
            data: {
                senderId,
                receiverId: Number(receiverId),
                content,
            },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});
exports.sendMessage = sendMessage;
// Get Messages (Conversation with a user)
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { otherUserId } = req.query; // If admin viewing user messages
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        let whereClause = {};
        // If user is admin and wants to see messages with a specific user
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'admin' && otherUserId) {
            whereClause = {
                OR: [
                    { senderId: userId, receiverId: Number(otherUserId) },
                    { senderId: Number(otherUserId), receiverId: userId },
                ]
            };
        }
        else {
            // If normal user, get all their messages (could be filtered by admin sender in future if multi-admin)
            // For now, assuming conversation is always User <-> Admin
            // But to be generic, let's just get all messages involved with this user
            whereClause = {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ]
            };
        }
        const messages = yield prisma_1.prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } },
            }
        });
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
});
exports.getMessages = getMessages;
// Mark as Read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { messageId } = req.params;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        // Ensure the user is the receiver
        yield prisma_1.prisma.message.updateMany({
            where: {
                id: Number(messageId),
                receiverId: userId,
            },
            data: { isRead: true },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Error marking message as read' });
    }
});
exports.markAsRead = markAsRead;
// Get Unread Count
const getUnreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const count = yield prisma_1.prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching unread count' });
    }
});
exports.getUnreadCount = getUnreadCount;
