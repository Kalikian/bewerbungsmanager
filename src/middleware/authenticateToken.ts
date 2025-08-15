import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Load secret key from environment variables
const SECRET_KEY = process.env.SECRET_KEY || 'your_fallback_secret';

/**
 * Express middleware to authenticate requests using JWT tokens.
 * Expects the token to be sent in the Authorization header as 'Bearer <token>'.
 * If valid, adds the decoded user payload to req.user.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Get the Authorization header value
  const authHeader = req.headers['authorization'];
  // Extract the token from 'Bearer <token>' format
  const token = authHeader?.split(' ')[1];

  if (!token) {
    // If no token is provided, return 401 Unauthorized
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify and decode the token using the secret key
    const decoded = jwt.verify(token, SECRET_KEY);
    // Attach the decoded user data to req.user for access in subsequent middleware/controllers
    // Note: TypeScript does not know about req.user by default, so extend the Request interface
    (req as any).user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}
