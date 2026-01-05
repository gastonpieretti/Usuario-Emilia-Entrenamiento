import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllProgress, createNewProgress } from '../services/progressService';

// Get Progress (User: Own, Admin: All or filtered)
export const getProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await getAllProgress(role!, userId, req.query.userId ? Number(req.query.userId) : undefined);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching progress' });
    }
};

// Create Progress (User only - for themselves)
export const createProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const progress = await createNewProgress(userId, req.body);
        res.status(201).json(progress);
    } catch (error) {
        res.status(500).json({ error: 'Error creating progress entry' });
    }
};
