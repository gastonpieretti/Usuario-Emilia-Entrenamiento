import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const registerUser = async (email: string, password: string, name: string, lastName: string, securityQuestion?: string, securityAnswer?: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // 1. Register in Supabase Auth
    console.log(`[SUPABASE] Attempting to sign up: ${email}`);
    const { data: sbData, error: sbError } = await supabase.auth.signUp({
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
    const passwordHash = await bcrypt.hash(password, 10);

    // Hash security answer if provided
    let securityAnswerHash = null;
    if (securityAnswer) {
        securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    }

    const user = await prisma.user.create({
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

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        supabaseUser: sbData.user
    };
};

export const getSecurityQuestion = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    return { question: user.securityQuestion };
};

export const recoverPassword = async (email: string, answer: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.securityAnswer) {
        throw new Error('User not found or no security info set');
    }

    const isValid = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isValid) {
        throw new Error('Incorrect security answer');
    }

    // Generate Reset Token
    const resetToken = jwt.sign(
        { userId: user.id, type: 'reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Mock Email Sending
    console.log(`[EMAIL MOCK] Subject: RECUPERACION DE CONTRASEÑA DE EMILIA ENTRENAMIENTO`);
    console.log(`[EMAIL MOCK] Link: http://localhost:3000/reset-password?token=${resetToken}`);

    return { success: true, message: 'Recovery email sent (mock)' };
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'reset') {
            throw new Error('Invalid token type');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                passwordHash,
                isApproved: false // Require admin re-approval
            }
        });

        return { success: true, message: 'Password reset successful. Account pending approval.' };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const loginUser = async (email: string, password: string) => {
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    // 1. First, try to authenticate with Supabase
    const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    const user = await prisma.user.findUnique({ where: { email } });

    if (sbError || !sbData.user) {
        console.log('[SUPABASE LOGIN FAIL]', sbError?.message || 'No user data');

        // 2. Fallback to local database for existing users not yet in Supabase
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // If local login succeeds, attempt a background "sync" to Supabase
        console.log(`[MIGRATION] Syncing user ${email} to Supabase...`);
        supabase.auth.signUp({ email, password }).then(({ error }) => {
            if (error) console.error('[MIGRATION ERROR]', error.message);
            else console.log(`[MIGRATION] User ${email} successfully synced to Supabase.`);
        });
    } else {
        console.log('[SUPABASE LOGIN SUCCESS]');
        if (!user) {
            throw new Error('User not found in local database. Please contact support.');
        }
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, planExpiresAt: user.planExpiresAt },
        supabaseUser: sbData.user || null
    };
};
