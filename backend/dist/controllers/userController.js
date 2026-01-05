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
exports.updateProfile = exports.updateUser = exports.getUser = exports.getUsers = exports.deletePermanently = exports.restoreFromTrash = exports.moveToTrash = exports.getTrash = void 0;
// ... existing imports
const userService_1 = require("../services/userService");
const smartOrchestrator_1 = require("../services/smartOrchestrator");
const routineOrchestrator_1 = require("../services/routineOrchestrator");
// ... existing functions
const getTrash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, userService_1.getDeletedUsers)();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching deleted users' });
    }
});
exports.getTrash = getTrash;
const moveToTrash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, userService_1.softDeleteUser)(Number(id));
        res.json({ message: 'User moved to trash' });
    }
    catch (error) {
        console.error('[UserController] Error in moveToTrash:', error);
        res.status(500).json({ error: 'Error moving user to trash' });
    }
});
exports.moveToTrash = moveToTrash;
const restoreFromTrash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, userService_1.restoreUser)(Number(id));
        res.json({ message: 'User restored' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error restoring user' });
    }
});
exports.restoreFromTrash = restoreFromTrash;
const deletePermanently = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, userService_1.permanentDeleteUser)(Number(id));
        res.json({ message: 'User permanently deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting user permanently' });
    }
});
exports.deletePermanently = deletePermanently;
// Get All Users (Admin only)
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const users = yield (0, userService_1.getAllUsers)(search);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});
exports.getUsers = getUsers;
// Get Single User (Admin only)
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield (0, userService_1.getUserById)(Number(id));
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('[UserController] Error in getUser:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});
exports.getUser = getUser;
// Update User (Admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield (0, userService_1.updateUserById)(Number(id), req.body);
        res.json(user);
    }
    catch (error) {
        console.error('[UserController] Error in updateUser:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
});
exports.updateUser = updateUser;
// Update Own Profile (Onboarding)
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log('Updating profile for user:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        console.log('Profile data:', req.body);
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!userId) {
            console.log('Unauthorized: No userId in request');
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Use the SmartOrchestrator to process the core business logic
        const analysis = yield smartOrchestrator_1.SmartOrchestrator.processOnboarding(userId, req.body);
        let routine = null;
        // If it's the final activation (checked by some flag or hasCompletedOnboarding)
        if (req.body.isFinalStep) {
            routine = yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(userId, 1); // Month 1
        }
        res.json({
            message: 'Profile updated successfully',
            analysis,
            routine // This contains the modelo_salida_rutina.json compliant structure
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});
exports.updateProfile = updateProfile;
