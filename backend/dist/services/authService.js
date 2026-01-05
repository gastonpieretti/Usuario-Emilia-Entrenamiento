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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.resetPassword = exports.recoverPassword = exports.getSecurityQuestion = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const supabase_1 = require("../lib/supabase");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const registerUser = (email, password, name, lastName, securityQuestion, securityAnswer) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }
    // 1. Register in Supabase Auth
    console.log(`[SUPABASE] Attempting to sign up: ${email}`);
    const { data: sbData, error: sbError } = yield supabase_1.supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                lastName,
                full_name: `${name} ${lastName}`
            }
        }
    });
    if (sbError) {
        console.error('[SUPABASE ERROR]', sbError);
        // If user already exists in Supabase but not in Prisma, we might want to proceed 
        // or tell the user. For now, let's treat it as an error to be safe.
        throw new Error(`Error en Supabase: ${sbError.message}`);
    }
    // 2. Register in Local Database (Prisma)
    const passwordHash = yield bcrypt_1.default.hash(password, 10);
    // Hash security answer if provided
    let securityAnswerHash = null;
    if (securityAnswer) {
        securityAnswerHash = yield bcrypt_1.default.hash(securityAnswer.toLowerCase().trim(), 10);
    }
    const user = yield prisma_1.prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            lastName,
            role: 'client',
            securityQuestion,
            securityAnswer: securityAnswerHash,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        supabaseUser: sbData.user
    };
});
exports.registerUser = registerUser;
const getSecurityQuestion = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    return { question: user.securityQuestion };
});
exports.getSecurityQuestion = getSecurityQuestion;
const recoverPassword = (email, answer) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.securityAnswer) {
        throw new Error('User not found or no security info set');
    }
    const isValid = yield bcrypt_1.default.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isValid) {
        throw new Error('Incorrect security answer');
    }
    // Generate Reset Token
    const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    // Mock Email Sending
    console.log(`[EMAIL MOCK] Subject: RECUPERACION DE CONTRASEÑA DE EMILIA ENTRENAMIENTO`);
    console.log(`[EMAIL MOCK] Link: http://localhost:3000/reset-password?token=${resetToken}`);
    return { success: true, message: 'Recovery email sent (mock)' };
});
exports.recoverPassword = recoverPassword;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.type !== 'reset') {
            throw new Error('Invalid token type');
        }
        const passwordHash = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma_1.prisma.user.update({
            where: { id: decoded.userId },
            data: {
                passwordHash,
                isApproved: false // Require admin re-approval
            }
        });
        return { success: true, message: 'Password reset successful. Account pending approval.' };
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
});
exports.resetPassword = resetPassword;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);
    // 1. First, try to authenticate with Supabase
    const { data: sbData, error: sbError } = yield supabase_1.supabase.auth.signInWithPassword({
        email,
        password,
    });
    const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (sbError || !sbData.user) {
        console.log('[SUPABASE LOGIN FAIL]', (sbError === null || sbError === void 0 ? void 0 : sbError.message) || 'No user data');
        // 2. Fallback to local database for existing users not yet in Supabase
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        // If local login succeeds, attempt a background "sync" to Supabase
        console.log(`[MIGRATION] Syncing user ${email} to Supabase...`);
        supabase_1.supabase.auth.signUp({ email, password }).then(({ error }) => {
            if (error)
                console.error('[MIGRATION ERROR]', error.message);
            else
                console.log(`[MIGRATION] User ${email} successfully synced to Supabase.`);
        });
    }
    else {
        console.log('[SUPABASE LOGIN SUCCESS]');
        if (!user) {
            throw new Error('User not found in local database. Please contact support.');
        }
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, planExpiresAt: user.planExpiresAt },
        supabaseUser: sbData.user || null
    };
});
exports.loginUser = loginUser;
