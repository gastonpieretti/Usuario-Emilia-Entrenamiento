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
    const user = await register(req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Funciones vacías para evitar errores de importación si las rutas las buscan
export const getSecurityQuestion = async (req: Request, res: Response) => res.status(200).send();
export const recoverPassword = async (req: Request, res: Response) => res.status(200).send();
export const resetPassword = async (req: Request, res: Response) => res.status(200).send();
