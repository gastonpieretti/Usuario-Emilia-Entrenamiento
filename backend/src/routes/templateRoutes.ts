import { Router } from 'express';
import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addExerciseToTemplate,
    removeExerciseFromTemplate,
    applyTemplateRoutine,
    updateTemplateExercise
} from '../controllers/templateController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', isAuthenticated, isAdmin, getTemplates);
router.post('/', isAuthenticated, isAdmin, createTemplate);
router.patch('/:id', isAuthenticated, isAdmin, updateTemplate);
router.delete('/:id', isAuthenticated, isAdmin, deleteTemplate);

router.post('/:id/exercises', isAuthenticated, isAdmin, addExerciseToTemplate);
router.patch('/exercises/:id', isAuthenticated, isAdmin, updateTemplateExercise);
router.delete('/exercises/:exerciseId', isAuthenticated, isAdmin, removeExerciseFromTemplate);

router.post('/apply', isAuthenticated, isAdmin, applyTemplateRoutine);

export default router;
