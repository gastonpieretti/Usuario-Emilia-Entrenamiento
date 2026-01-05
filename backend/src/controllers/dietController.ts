import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllDiets, createNewDiet, updateDietById, deleteDietById } from '../services/dietService';

// Get Diets (User: Own, Admin: All or filtered)
export const getDiets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const diets = await getAllDiets(role!, userId, req.query.userId ? Number(req.query.userId) : undefined);
        res.json(diets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching diets' });
    }
};

// Create Diet (Admin only)
export const createDiet = async (req: AuthRequest, res: Response) => {
    try {
        const diet = await createNewDiet(req.body);
        res.status(201).json(diet);
    } catch (error) {
        res.status(500).json({ error: 'Error creating diet' });
    }
};

// Update Diet (Admin only)
export const updateDiet = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const diet = await updateDietById(Number(id), req.body);
        res.json(diet);
    } catch (error) {
        res.status(500).json({ error: 'Error updating diet' });
    }
};

// Delete Diet (Admin only)
export const deleteDiet = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await deleteDietById(Number(id));
        res.json({ message: 'Diet deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting diet' });
    }
};
