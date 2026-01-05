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
exports.me = exports.reset = exports.recover = exports.getQuestion = exports.logout = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const userService_1 = require("../services/userService");
// Update register to accept security fields
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Registering user:', req.body.email);
        const { email, password, name, lastName, securityQuestion, securityAnswer } = req.body;
        const result = yield (0, authService_1.registerUser)(email, password, name, lastName, securityQuestion, securityAnswer);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield (0, authService_1.loginUser)(email, password);
        // Check approval status
        const user = yield (0, userService_1.getUserById)(result.user.id);
        if ((user === null || user === void 0 ? void 0 : user.role) === 'client' && !(user === null || user === void 0 ? void 0 : user.isApproved)) {
            return res.status(403).json({ error: 'Tu cuenta está pendiente de aprobación por el administrador.' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Logged out successfully' });
});
exports.logout = logout;
// Forgot Password Flow
// 1. Get Security Question
const getQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const { getSecurityQuestion } = yield Promise.resolve().then(() => __importStar(require('../services/authService'))); // Lazy import or move to top if prefer
        const result = yield getSecurityQuestion(email);
        res.json(result);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
exports.getQuestion = getQuestion;
// 2. Verify and Recover
const recover = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, answer } = req.body;
        const { recoverPassword } = yield Promise.resolve().then(() => __importStar(require('../services/authService')));
        const result = yield recoverPassword(email, answer);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.recover = recover;
// 3. Reset Password
const reset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        const { resetPassword } = yield Promise.resolve().then(() => __importStar(require('../services/authService')));
        const result = yield resetPassword(token, newPassword);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.reset = reset;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = yield (0, userService_1.getUserById)(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.me = me;
