"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        const profile = yield (0, userService_1.updateUserProfile)(userId, req.body);
        console.log('Profile updated successfully');
        // TRIGGER: onUserRegistrationComplete
        let orchestrationMessage = '¡Perfil y rutina creados con éxito!';
        try {
            const { generateOrchestratedRoutine } = yield Promise.resolve().then(() => __importStar(require('../services/routineOrchestrator')));
            yield generateOrchestratedRoutine(userId);
            console.log('Automatic routine generation triggered for user:', userId);
        }
        catch (genError) {
            console.error('Failed to auto-generate routine:', genError);
            orchestrationMessage = genError.message || 'El perfil se guardó, pero hubo un detalle al generar la rutina automática.';
        }
        res.json(Object.assign(Object.assign({}, profile), { orchestrationMessage }));
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});
exports.updateProfile = updateProfile;
