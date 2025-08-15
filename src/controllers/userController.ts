import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserNameSchema,
  changeUserPasswordSchema,
  userIdParamSchema,
} from '../validation/user/userSchema.js';

// use typed HttpErrors to delegate all error responses to the central errorHandler
import { BadRequestError } from '../errors.js';

// Use SECRET_KEY from environment variables, or fallback to a default string if not set
const SECRET_KEY = process.env.SECRET_KEY || 'your_fallback_secret';

/* ---------------------------- Controller functions ---------------------------- */

// register new user
export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName } = registerUserSchema.parse(req.body);

    const id = await userModel.registerUser({ email, password, firstName, lastName });
    res.status(201).json({ message: 'User created', id });
  } catch (error) {
    next(error);
  }
}

// login user and generate JWT token
export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginUserSchema.parse(req.body);

    // Model throws UnauthorizedError (401) on unknown email or bad password
    const userId = await userModel.loginUser({ email, password });

    // Generate JWT token (keep payload minimal to avoid leaking data)
    const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    next(error);
  }
}

// get user profile by id (protected route)
export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.params.id) {
      userIdParamSchema.parse(req.params);
    }

    // Prefer the authenticated user's id if available, otherwise use param id
    const userId = req.user?.id ?? (req.params.id ? Number(req.params.id) : undefined);

    //make it explicit when neither token nor :id are provided
    if (userId == null || Number.isNaN(userId)) {
      // Bad request -> handled centrally as 400
      throw new BadRequestError('Missing or invalid user id');
    }

    const user = await userModel.getUserById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

// Update user's first and/or last name (protected route)
export async function updateUserName(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate body (ZodError -> 422). Schema allows optional fields.
    const { firstName, lastName } = updateUserNameSchema.parse(req.body);

    // Same user id resolution as above
    const userId = req.user?.id ?? (req.params.id ? Number(req.params.id) : undefined);
    if (userId == null || Number.isNaN(userId)) {
      throw new BadRequestError('Missing or invalid user id');
    }

    // Model throws: - BadRequestError(400) if no fields provided
    // - NotFoundError(404) if user doesn't exist
    await userModel.updateUserName({ id: userId, firstName, lastName });

    // If we reach here, update succeeded
    res.json({ message: 'User updated' });
  } catch (error) {
    next(error);
  }
}

// change user password (protected route)
export async function changeUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = changeUserPasswordSchema.parse(req.body);

    const userId = req.user?.id ?? (req.params.id ? Number(req.params.id) : undefined);
    if (userId == null || Number.isNaN(userId)) {
      throw new BadRequestError('Missing or invalid user id');
    }

    // Model throws:- NotFoundError(404) if user not found
    // - UnauthorizedError(401) if old password is wrong
    await userModel.changeUserPassword({ id: userId, oldPassword, newPassword });

    res.json({ message: 'Password changed' });
  } catch (error) {
    next(error);
  }
}

// delete user account (protected route)
export async function deleteUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.params.id) {
      userIdParamSchema.parse(req.params); // ZodError -> 422
    }

    const userId = req.user?.id ?? (req.params.id ? Number(req.params.id) : undefined);
    if (userId == null || Number.isNaN(userId)) {
      throw new BadRequestError('Missing or invalid user id');
    }

    // Model throws NotFoundError(404) when user does not exist
    await userModel.deleteUserById(userId);

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}
