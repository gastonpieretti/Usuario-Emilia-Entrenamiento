import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export const getAllUsers = async (search?: string) => {
    let whereClause: any = { isDeleted: false };
    if (search) {
        whereClause = {
            ...whereClause,
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        };
    }

    return prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            role: true,
            createdAt: true,
            isApproved: true,
            planExpiresAt: true,
            routines: {
                select: {
                    id: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getDeletedUsers = async () => {
    return prisma.user.findMany({
        where: { isDeleted: true },
        select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
        orderBy: { updatedAt: 'desc' },
    });
};

export const softDeleteUser = async (id: number) => {
    return prisma.user.update({
        where: { id },
        data: { isDeleted: true },
    });
};

export const restoreUser = async (id: number) => {
    return prisma.user.update({
        where: { id },
        data: { isDeleted: false },
    });
};

export const permanentDeleteUser = async (id: number) => {
    // Delete related data first (Manual Cascade)
    await prisma.routineExercise.deleteMany({ where: { routine: { userId: id } } });
    await prisma.routine.deleteMany({ where: { userId: id } });
    await prisma.diet.deleteMany({ where: { userId: id } });
    await prisma.progress.deleteMany({ where: { userId: id } });
    await prisma.userProfile.deleteMany({ where: { userId: id } });
    await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });

    return prisma.user.delete({
        where: { id },
    });
};

export const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            role: true,
            isApproved: true,
            hasCompletedOnboarding: true,
            height: true,
            weight: true,
            age: true,
            createdAt: true,
            routines: true,
            diets: true,
            profile: true,
            planExpiresAt: true,
        },
    });
};

export const updateUserById = async (id: number, data: any) => {
    if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }

    // Extract profile data to handle relation update
    const { profile, ...rest } = data;

    // Filter userData to only updatable fields to prevent Prisma errors on unknown fields
    const allowedFields = ['email', 'name', 'lastName', 'isApproved', 'role', 'height', 'weight', 'age', 'hasCompletedOnboarding', 'isDeleted', 'securityQuestion', 'securityAnswer', 'planExpiresAt'];
    const userData: any = {};
    for (const key of allowedFields) {
        if (rest[key] !== undefined && rest[key] !== null) {
            let value = rest[key];

            // Cast numeric fields
            if (['age'].includes(key)) {
                value = parseInt(value);
                if (isNaN(value)) continue;
            }
            if (['height', 'weight'].includes(key)) {
                value = parseFloat(value);
                if (isNaN(value)) continue;
            }

            userData[key] = value;
        }
    }

    const updateData: any = {
        ...userData,
    };

    if (profile) {
        // Clean profile data - UPDATED with standardized fields
        const allowedProfileFields = [
            'gender', 'age', 'height_cm', 'weight_kg',
            'experienceLevel', 'goal',
            'daysPerWeek', 'sessionDurationMin',
            'trainingLocation', 'equipment',
            'painRodilla', 'painColumna', 'painHombro',
            'whatsapp', 'city', 'country', 'dob', 'occupation',
            'injuries', 'dietPreference', 'mealsPerDay', 'waterIntake', 'dislikedFood'
        ];
        const cleanProfile: any = {};
        for (const key of allowedProfileFields) {
            if (profile[key] !== undefined && profile[key] !== null) {
                let value = profile[key];

                // Strict type casting for known numeric fields
                if (['age', 'daysPerWeek', 'mealsPerDay', 'sessionDurationMin'].includes(key)) {
                    value = parseInt(value);
                    if (isNaN(value)) continue; // Skip if invalid number
                }
                if (['height_cm', 'weight_kg'].includes(key)) {
                    value = parseFloat(value);
                    if (isNaN(value)) continue;
                }

                cleanProfile[key] = value;
            }
        }

        updateData.profile = {
            upsert: {
                create: cleanProfile,
                update: cleanProfile,
            },
        };
    }

    try {
        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
        });
        return updated;
    } catch (error: any) {
        console.error('[UserService] Prisma update error:', error);
        throw error;
    }
};

export const updateUserProfile = async (userId: number, data: any) => {
    const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: {
            ...data,
            userId,
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: { hasCompletedOnboarding: true },
    });

    return profile;
};
