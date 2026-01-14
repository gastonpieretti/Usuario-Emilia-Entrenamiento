import { Request, Response } from 'express';
import { login, register } from '../services/authService';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await register(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Funciones de utilidad para evitar errores de importación en rutas
export const getSecurityQuestion = async (req: Request, res: Response) => res.status(200).json({ message: "Not implemented" });
export const recoverPassword = async (req: Request, res: Response) => res.status(200).json({ message: "Not implemented" });
export const resetPassword = async (req: Request, res: Response) => res.status(200).json({ message: "Not implemented" });
