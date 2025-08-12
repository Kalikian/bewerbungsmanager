import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { errorHandler } from '../middleware/errorHandler.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// All routes below require authentication:
router.get('/account', authenticateToken, userController.getUserProfile, errorHandler);
router.patch('/account', authenticateToken, userController.updateUserName, errorHandler);
router.patch(
  '/account/password',
  authenticateToken,
  userController.changeUserPassword,
  errorHandler,
);
router.delete('/account', authenticateToken, userController.deleteUserProfile, errorHandler);

export default router;
