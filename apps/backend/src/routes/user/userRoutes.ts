import express from 'express';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import * as userController from '../../controllers/user/userController.js';

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// All routes below require authentication:
router.get('/account', authenticateToken, userController.getUserProfile);
router.patch('/account', authenticateToken, userController.updateUserName);
router.patch('/account/password', authenticateToken, userController.changeUserPassword);
router.delete('/account', authenticateToken, userController.deleteUserProfile);

export default router;
