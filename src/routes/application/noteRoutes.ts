import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import * as noteController from '../../controllers/application/noteController.js';

const router = Router();

// All routes below require authentication:
router.get(
  '/:applicationId/notes',
  authenticateToken,
  noteController.getNotesForApplication,
  errorHandler,
);
router.post('/:applicationId/notes', authenticateToken, noteController.createNote, errorHandler);
router.patch(
  '/:applicationId/notes/:noteId',
  authenticateToken,
  noteController.updateNote,
  errorHandler,
);
router.delete(
  '/:applicationId/notes/:noteId',
  authenticateToken,
  noteController.deleteNote,
  errorHandler,
);

export default router;
