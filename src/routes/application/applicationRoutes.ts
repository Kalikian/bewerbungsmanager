// src/routes/applicationRoutes.ts
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as applicationController from '../../controllers/application/applicationController.js';

const router = Router();

// All routes below require authentication:
router.post('/applications', authenticateToken, applicationController.createApplication);
router.get('/applications', authenticateToken, applicationController.getApplications);
router.put('/applications/:id', authenticateToken, applicationController.updateApplication);
router.delete('/applications/:id', authenticateToken, applicationController.deleteApplication);

export default router;
