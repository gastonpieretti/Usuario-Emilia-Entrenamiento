import { Request, Response } from 'express';
import { getMotivationalResponse } from '../services/aiService';

export const getMotivation = async (req: Request, res: Response) => {
    try {
        const { nombre_usuario, objetivo_emocional } = req.body;

        if (!nombre_usuario || !objetivo_emocional) {
            return res.status(400).json({ error: 'nombre_usuario y objetivo_emocional son requeridos.' });
        }

        const response = await getMotivationalResponse(nombre_usuario, objetivo_emocional);
        res.json({ message: response });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
