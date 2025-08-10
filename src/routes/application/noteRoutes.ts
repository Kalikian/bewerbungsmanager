import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as noteController from '../../controllers/application/noteController.js';

const router = Router();

// All routes below require authentication:
router.get(
  '/applications/:applicationId/notes',
  authenticateToken,
  noteController.getNotesForApplication,
);
router.post('/notes', authenticateToken, noteController.createNote);
router.patch('/notes', authenticateToken, noteController.updateNote);
router.delete('/notes/:noteId', authenticateToken, noteController.deleteNote);

export default router;
