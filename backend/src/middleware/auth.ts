import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// USAMOS LA MISMA LLAVE QUE EN EL SERVICIO
const JWT_SECRET = process.env.JWT_SECRET || 'EMILIA_SECRET_KEY_2026';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.error('[AUTH ERROR] No se proporcionó token');
        return res.status(401).json({ error: 'No autorizado. Por favor, inicia sesión.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificamos el token con la llave maestra única
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
        req.user = decoded;
        next();
    } catch (error: any) {
        console.error('[AUTH ERROR] Token inválido o expirado:', error.message);
        return res.status(401).json({ error: 'Tu sesión ha expirado. Ingresa de nuevo.' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};
