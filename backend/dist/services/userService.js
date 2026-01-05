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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.updateUserById = exports.getUserById = exports.permanentDeleteUser = exports.restoreUser = exports.softDeleteUser = exports.getDeletedUsers = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllUsers = (search) => __awaiter(void 0, void 0, void 0, function* () {
    let whereClause = { isDeleted: false };
    if (search) {
        whereClause = Object.assign(Object.assign({}, whereClause), { OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ] });
    }
    return prisma_1.prisma.user.findMany({
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
});
exports.getAllUsers = getAllUsers;
const getDeletedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findMany({
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
});
exports.getDeletedUsers = getDeletedUsers;
const softDeleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
    });
});
exports.softDeleteUser = softDeleteUser;
const restoreUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { isDeleted: false },
    });
});
exports.restoreUser = restoreUser;
const permanentDeleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete related data first (Manual Cascade)
    yield prisma_1.prisma.routineExercise.deleteMany({ where: { routine: { userId: id } } });
    yield prisma_1.prisma.routine.deleteMany({ where: { userId: id } });
    yield prisma_1.prisma.diet.deleteMany({ where: { userId: id } });
    yield prisma_1.prisma.progress.deleteMany({ where: { userId: id } });
    yield prisma_1.prisma.userProfile.deleteMany({ where: { userId: id } });
    yield prisma_1.prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
    return prisma_1.prisma.user.delete({
        where: { id },
    });
});
exports.permanentDeleteUser = permanentDeleteUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUnique({
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
});
exports.getUserById = getUserById;
const updateUserById = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.password) {
        data.passwordHash = yield bcrypt_1.default.hash(data.password, 10);
        delete data.password;
    }
    // Extract profile data to handle relation update
    const { profile } = data, rest = __rest(data, ["profile"]);
    // Filter userData to only updatable fields to prevent Prisma errors on unknown fields
    const allowedFields = ['email', 'name', 'lastName', 'isApproved', 'role', 'height', 'weight', 'age', 'hasCompletedOnboarding', 'isDeleted', 'securityQuestion', 'securityAnswer', 'planExpiresAt'];
    const userData = {};
    for (const key of allowedFields) {
        if (rest[key] !== undefined && rest[key] !== null) {
            let value = rest[key];
            // Cast numeric fields
            if (['age'].includes(key)) {
                value = parseInt(value);
                if (isNaN(value))
                    continue;
            }
            if (['height', 'weight'].includes(key)) {
                value = parseFloat(value);
                if (isNaN(value))
                    continue;
            }
            userData[key] = value;
        }
    }
    const updateData = Object.assign({}, userData);
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
        const cleanProfile = {};
        for (const key of allowedProfileFields) {
            if (profile[key] !== undefined && profile[key] !== null) {
                let value = profile[key];
                // Strict type casting for known numeric fields
                if (['age', 'daysPerWeek', 'mealsPerDay', 'sessionDurationMin'].includes(key)) {
                    value = parseInt(value);
                    if (isNaN(value))
                        continue; // Skip if invalid number
                }
                if (['height_cm', 'weight_kg'].includes(key)) {
                    value = parseFloat(value);
                    if (isNaN(value))
                        continue;
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
        const updated = yield prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return updated;
    }
    catch (error) {
        console.error('[UserService] Prisma update error:', error);
        throw error;
    }
});
exports.updateUserById = updateUserById;
const updateUserProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.prisma.userProfile.upsert({
        where: { userId },
        update: data,
        create: Object.assign(Object.assign({}, data), { userId }),
    });
    yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: { hasCompletedOnboarding: true },
    });
    return profile;
});
exports.updateUserProfile = updateUserProfile;
