import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import * as applicationController from '../../controllers/application/applicationController.js';

const router = Router();

// All routes below require authentication:
router.post('/', authenticateToken, applicationController.createApplication, errorHandler);
router.get('/', authenticateToken, applicationController.getApplications, errorHandler);
router.get('/:id', authenticateToken, applicationController.getApplicationById, errorHandler);
router.patch('/:id', authenticateToken, applicationController.updateApplication, errorHandler);
router.delete('/:id', authenticateToken, applicationController.deleteApplication, errorHandler);

export default router;
