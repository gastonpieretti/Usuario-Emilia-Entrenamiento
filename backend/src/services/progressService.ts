import { prisma } from '../lib/prisma';

export const getAllProgress = async (role: string, userId: number, targetUserId?: number) => {
    let whereClause = {};
    if (role === 'client') {
        whereClause = { userId };
    } else if (role === 'admin') {
        if (targetUserId) {
            whereClause = { userId: targetUserId };
        }
    }

    return prisma.progress.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true, email: true } } },
    });
};

export const createNewProgress = async (userId: number, data: any) => {
    return prisma.progress.create({
        data: {
            userId,
            weight: Number(data.weight),
            waist: data.waist ? Number(data.waist) : null,
            legs: data.legs ? Number(data.legs) : null,
            hips: data.hips ? Number(data.hips) : null,
        },
    });
};
