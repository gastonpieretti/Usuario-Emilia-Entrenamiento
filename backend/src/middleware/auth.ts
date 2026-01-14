import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// LLAVE MAESTRA ÚNICA
const JWT_SECRET = process.env.JWT_SECRET || 'EMILIA_SECRET_KEY_2026';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[AUTH] No hay token o formato incorrecto');
        return res.status(401).json({ error: 'Sesión no iniciada' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
        req.user = decoded;
        next();
    } catch (error: any) {
        console.error('[AUTH] Error de validación:', error.message);
        // Enviamos 401 para que el frontend sepa que debe pedir login
        return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Requiere permisos de administrador' });
    }
    next();
};
