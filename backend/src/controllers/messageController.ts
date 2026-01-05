import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

// Send Message
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user?.userId;
        const { receiverId, content } = req.body;

        if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: Number(receiverId),
                content,
            },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
};

// Get Messages (Conversation with a user)
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { otherUserId } = req.query; // If admin viewing user messages

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        let whereClause: any = {};

        // If user is admin and wants to see messages with a specific user
        if (req.user?.role === 'admin' && otherUserId) {
            whereClause = {
                OR: [
                    { senderId: userId, receiverId: Number(otherUserId) },
                    { senderId: Number(otherUserId), receiverId: userId },
                ]
            };
        } else {
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

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } },
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
};

// Mark as Read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { messageId } = req.params;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Ensure the user is the receiver
        await prisma.message.updateMany({
            where: {
                id: Number(messageId),
                receiverId: userId,
            },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error marking message as read' });
    }
};

// Get Unread Count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching unread count' });
    }
};
