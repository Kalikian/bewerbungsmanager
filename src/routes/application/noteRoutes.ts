import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as noteController from '../../controllers/application/noteController.js';

const router = Router();

// All routes below require authentication:
router.get('/:applicationId/notes', authenticateToken, noteController.getNotesForApplication);
router.post('/:applicationId/notes', authenticateToken, noteController.createNote);
router.patch('/:applicationId/notes/:noteId', authenticateToken, noteController.updateNote);
router.delete('/:applicationId/notes/:noteId', authenticateToken, noteController.deleteNote);

export default router;
