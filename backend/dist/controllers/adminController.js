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
exports.updateUserPlan = exports.getPendingUsers = exports.approveUser = void 0;
const prisma_1 = require("../lib/prisma");
const emailService_1 = require("../services/emailService");
const approveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prisma_1.prisma.user.update({
            where: { id: Number(id) },
            data: { isApproved: true },
        });
        // (Routine approval logic removed as isApproved was removed from Routine model)
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
        const allPending = yield prisma_1.prisma.user.findMany({
            where: {
                role: 'client',
                isDeleted: false,
                OR: [
                    { isApproved: false },
                    { routines: { some: { isApproved: false } } }
                ]
            },
            include: {
                routines: {
                    where: { isApproved: false },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        // Accounts that need registration approval (isApproved: false and no onboarding done)
        const pendingAccounts = allPending.filter(u => !u.isApproved && !u.hasCompletedOnboarding);
        // Users with pending routines (either they just finished onboarding OR they have unapproved routine days)
        const usersWithPendingRoutines = allPending.filter(u => u.routines.length > 0 || (u.hasCompletedOnboarding && !u.isApproved));
        res.json({
            pendingAccounts,
            pendingRoutines: usersWithPendingRoutines.map(u => ({
                id: u.id,
                name: u.name,
                lastName: u.lastName,
                email: u.email,
                onboardingDate: u.updatedAt,
                isAccountApproved: u.isApproved,
                pendingRoutinesCount: u.routines.length
            }))
        });
    }
    catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ error: 'Error fetching pending users' });
    }
});
exports.getPendingUsers = getPendingUsers;
const updateUserPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { planStartDate, acquiredMonths, planSchedule } = req.body;
        const user = yield prisma_1.prisma.user.update({
            where: { id: Number(id) },
            data: {
                planStartDate: planStartDate ? new Date(planStartDate) : undefined,
                acquiredMonths: acquiredMonths ? Number(acquiredMonths) : undefined,
                planSchedule: planSchedule || undefined,
            },
        });
        // Recalcular activationDate para las rutinas existentes
        const routines = yield prisma_1.prisma.routine.findMany({
            where: { userId: Number(id) }
        });
        for (const routine of routines) {
            let activationDate = null;
            // Prioridad: planSchedule (Configuración explícita por mes)
            if (planSchedule && Array.isArray(planSchedule)) {
                const monthConfig = planSchedule.find((m) => m.month === routine.month);
                if (monthConfig && monthConfig.start) {
                    activationDate = new Date(monthConfig.start);
                }
            }
            // Fallback: planStartDate (Cálculo automático de 30 días)
            if (!activationDate && planStartDate) {
                activationDate = new Date(planStartDate);
                activationDate.setDate(activationDate.getDate() + (routine.month - 1) * 30);
            }
            if (activationDate) {
                yield prisma_1.prisma.routine.update({
                    where: { id: routine.id },
                    data: { activationDate }
                });
            }
        }
        res.json({ message: 'Plan actualizado correctamente', user });
    }
    catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ error: 'Error al actualizar el plan' });
    }
});
exports.updateUserPlan = updateUserPlan;
