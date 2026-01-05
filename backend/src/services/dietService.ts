import { prisma } from '../lib/prisma';

export const getAllDiets = async (role: string, userId: number, targetUserId?: number) => {
    let whereClause = {};
    if (role === 'client') {
        whereClause = { userId };
    } else if (role === 'admin') {
        if (targetUserId) {
            whereClause = { userId: targetUserId };
        }
    }

    return prisma.diet.findMany({
        where: whereClause,
        include: { user: { select: { name: true, email: true } } },
    });
};

export const createNewDiet = async (data: any) => {
    return prisma.diet.create({
        data: {
            userId: Number(data.userId),
            title: data.title,
            description: data.description,
        },
    });
};

export const updateDietById = async (id: number, data: any) => {
    return prisma.diet.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
        },
    });
};

export const deleteDietById = async (id: number) => {
    return prisma.diet.delete({
        where: { id },
    });
};
