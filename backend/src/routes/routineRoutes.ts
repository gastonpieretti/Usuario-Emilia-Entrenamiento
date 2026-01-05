import { Router } from 'express';
import { getRoutineHistory, getUserRoutineHistory, restoreRoutine } from '../controllers/historyController';
import { getPendingRoutinesSummary, approveRoutine, denyRoutine, getRoutines, generateRoutine, createRoutine, updateRoutineExercise, deleteRoutineExercise, getAllExercises, addRoutineExercise, updateRoutine, deleteRoutine, duplicateRoutine } from '../controllers/routineController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/pending', isAuthenticated, isAdmin, getPendingRoutinesSummary);
router.post('/:id/approve', isAuthenticated, isAdmin, approveRoutine);
router.delete('/:id/deny', isAuthenticated, isAdmin, denyRoutine);

router.post('/generate', isAuthenticated, isAdmin, generateRoutine);
router.post('/', isAuthenticated, isAdmin, createRoutine);
router.get('/', isAuthenticated, getRoutines);
router.get('/exercises/all', isAuthenticated, isAdmin, getAllExercises);
router.post('/exercises', isAuthenticated, isAdmin, addRoutineExercise);
router.patch('/:id', isAuthenticated, isAdmin, updateRoutine);
router.delete('/:id', isAuthenticated, isAdmin, deleteRoutine);
router.post('/:id/duplicate', isAuthenticated, isAdmin, duplicateRoutine);

// History routes
router.get('/history/user/:userId', isAuthenticated, isAdmin, getUserRoutineHistory);
router.get('/:routineId/history', isAuthenticated, isAdmin, getRoutineHistory);
router.post('/history/:historyId/restore', isAuthenticated, isAdmin, restoreRoutine);
router.patch('/exercises/:id', isAuthenticated, isAdmin, updateRoutineExercise);
router.delete('/exercises/:id', isAuthenticated, isAdmin, deleteRoutineExercise);

export default router;
