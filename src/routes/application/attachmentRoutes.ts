import { Router } from 'express';
import { upload } from '../../middleware/upload.js';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as attachmentController from '../../controllers/application/attachmentController.js';

const router = Router();

// Upload a new attachment to an application
router.post(
  '/applicationId/attachments',
  authenticateToken,
  upload.single('file'),
  attachmentController.uploadAttachment,
);

// All routes below require authentication:
router.get('/applicationId/attachments', authenticateToken, attachmentController.listAttachments);
router.get('/attachmentId', authenticateToken, attachmentController.getAttachment);
router.get('/attachmentId/download', authenticateToken, attachmentController.downloadAttachment);
router.delete('/attachmentId', authenticateToken, attachmentController.deleteAttachment);

export default router;
