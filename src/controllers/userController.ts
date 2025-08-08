import { Request, Response } from 'express';
import * as userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

//Use SECRET_KEY from environment variables, or fallback to a default string if not set
const SECRET_KEY = process.env.SECRET_KEY || 'your_fallback_secret';

//register new user
export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const id = await userModel.registerUser({ email, password, firstName, lastName });
    res.status(201).json({ message: 'User created', id });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
}

//login user and generate JWT token
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    //userModel.loginUser returns the user id on successful login
    const userId = await userModel.loginUser({ email, password });

    //Generate JWT token with user id and email as payload
    const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '2h' }); // Token is valid for 2 hours

    res.status(200).json({ message: 'Login successful', token });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
}

//get user profile by id (protected route)
export async function getUserProfile(req: Request, res: Response) {
  try {
    // ID aus Authentifizierungsmiddleware
    const userId = req.user?.id ?? Number(req.params.id); // falls keine Auth, dann über URL
    const user = await userModel.getUserById(userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'User not found' });
  }
}

//Update user's first and/or last name (protected route)
export async function updateUserName(req: Request, res: Response) {
  try {
    const userId = req.user?.id ?? Number(req.params.id);
    const { firstName, lastName } = req.body;
    const success = await userModel.updateUserName({ id: userId, firstName, lastName });
    if (!success) {
      return res.status(400).json({ error: 'No fields to update or user not found' });
    }
    res.json({ message: 'User updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

//change user password (protected route)
export async function changeUserPassword(req: Request, res: Response) {
  try {
    const userId = req.user?.id ?? Number(req.params.id);
    const { oldPassword, newPassword } = req.body;
    const success = await userModel.changeUserPassword({ id: userId, oldPassword, newPassword });
    if (!success) {
      return res.status(400).json({ error: 'Password not changed' });
    }
    res.json({ message: 'Password changed' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

//delete user account (protected route)
export async function deleteUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id ?? Number(req.params.id);
    const success = await userModel.deleteUserById(userId);
    if (!success) {
      return res.status(400).json({ error: 'User could not be deleted' });
    }
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
