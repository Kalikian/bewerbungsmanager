import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as applicationController from '../../controllers/application/applicationController.js';

const router = Router();

// All routes below require authentication:
router.post('/', authenticateToken, applicationController.createApplication);
router.get('/', authenticateToken, applicationController.getApplications);
router.get('/:id', authenticateToken, applicationController.getApplicationById);
router.patch('/:id', authenticateToken, applicationController.updateApplication);
router.delete('/:id', authenticateToken, applicationController.deleteApplication);

export default router;
