import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { getUserById } from '../services/userService';

// Update register to accept security fields
export const register = async (req: Request, res: Response) => {
    try {
        console.log('Registering user:', req.body.email);
        const { email, password, name, lastName, securityQuestion, securityAnswer } = req.body;
        const result = await registerUser(email, password, name, lastName, securityQuestion, securityAnswer);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        // Check approval status
        const user = await getUserById(result.user.id);
        if (user?.role === 'client' && !user?.isApproved) {
            return res.status(403).json({ error: 'Tu cuenta está pendiente de aprobación por el administrador.' });
        }

        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
};

// Forgot Password Flow

// 1. Get Security Question
export const getQuestion = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const { getSecurityQuestion } = await import('../services/authService'); // Lazy import or move to top if prefer
        const result = await getSecurityQuestion(email);
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

// 2. Verify and Recover
export const recover = async (req: Request, res: Response) => {
    try {
        const { email, answer } = req.body;
        const { recoverPassword } = await import('../services/authService');
        const result = await recoverPassword(email, answer);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Reset Password
export const reset = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        const { resetPassword } = await import('../services/authService');
        const result = await resetPassword(token, newPassword);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const me = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
