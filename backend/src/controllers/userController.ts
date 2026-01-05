import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
// ... existing imports
import {
    getAllUsers,
    getUserById,
    updateUserById,
    updateUserProfile,
    getDeletedUsers,
    softDeleteUser,
    restoreUser,
    permanentDeleteUser
} from '../services/userService';
import { SmartOrchestrator } from '../services/smartOrchestrator';
import { generateOrchestratedRoutine } from '../services/routineOrchestrator';

// ... existing functions

export const getTrash = async (req: AuthRequest, res: Response) => {
    try {
        const users = await getDeletedUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching deleted users' });
    }
};

export const moveToTrash = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await softDeleteUser(Number(id));
        res.json({ message: 'User moved to trash' });
    } catch (error) {
        console.error('[UserController] Error in moveToTrash:', error);
        res.status(500).json({ error: 'Error moving user to trash' });
    }
};

export const restoreFromTrash = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await restoreUser(Number(id));
        res.json({ message: 'User restored' });
    } catch (error) {
        res.status(500).json({ error: 'Error restoring user' });
    }
};

export const deletePermanently = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await permanentDeleteUser(Number(id));
        res.json({ message: 'User permanently deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting user permanently' });
    }
};

// Get All Users (Admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;
        const users = await getAllUsers(search as string);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Get Single User (Admin only)
export const getUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await getUserById(Number(id));

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('[UserController] Error in getUser:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

// Update User (Admin only)
export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await updateUserById(Number(id), req.body);
        res.json(user);
    } catch (error) {
        console.error('[UserController] Error in updateUser:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

// Update Own Profile (Onboarding)
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Updating profile for user:', req.user?.userId);
        console.log('Profile data:', req.body);
        const userId = req.user?.userId;
        if (!userId) {
            console.log('Unauthorized: No userId in request');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Use the SmartOrchestrator to process the core business logic
        const analysis = await SmartOrchestrator.processOnboarding(userId, req.body);

        let routine = null;
        // If it's the final activation (checked by some flag or hasCompletedOnboarding)
        if (req.body.isFinalStep) {
            routine = await generateOrchestratedRoutine(userId, 1); // Month 1
        }

        res.json({
            message: 'Profile updated successfully',
            analysis,
            routine // This contains the modelo_salida_rutina.json compliant structure
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};
