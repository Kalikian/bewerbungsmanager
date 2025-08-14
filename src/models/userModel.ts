import pool from '../db/db.js';
import bcrypt from 'bcrypt';
import { mapUserDbRow } from '../utils/mappers.js';
import { NewUser, UserDB, LoginUser, UpdateUserName, ChangePasswordData } from '../types/user.js';
import { UnauthorizedError } from '../errors.js';

//register new user
export async function registerUser(user: NewUser): Promise<number> {
  // check the email if already assigned
  const check = await pool.query('SELECT id FROM "user" WHERE email = $1', [user.email]);
  if ((check.rowCount ?? 0) > 0) {
    throw new Error('User with this Email is already registered');
  }
  // hash the password
  const hashedPassword = await bcrypt.hash(user.password, 10);
  // insert the new user into the database
  const result = await pool.query(
    'INSERT INTO "user" (email, password, first_name, last_name) VALUES ($1 ,$2, $3, $4) RETURNING id',
    [user.email, hashedPassword, user.firstName, user.lastName],
  );
  // Return the new user's id
  return result.rows[0].id;
}

// login user
export async function loginUser(credentials: LoginUser): Promise<number> {
  // check if the user exists
  const result = await pool.query('SELECT id, password FROM "user" WHERE email = $1', [
    credentials.email,
  ]);

  const user = result.rows[0] as UserDB | undefined;

  if (!user) throw new UnauthorizedError();

  // compare the password
  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError();
  }
  // Return the user's id
  return user.id;
}

//get user profile by id
export async function getUserById(id: number): Promise<Omit<UserDB, 'password'>> {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name FROM "user" WHERE id = $1',
    [id],
  );
  if ((result.rowCount ?? 0) === 0) {
    throw new Error('User not found');
  }
  return mapUserDbRow(result.rows[0]);
}

// update user profile
export async function updateUserName(data: UpdateUserName): Promise<boolean> {
  // dynamic querry for partial updates
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (data.firstName) {
    fields.push(`first_name = $${idx++}`);
    values.push(data.firstName);
  }
  if (data.lastName) {
    fields.push(`last_name = $${idx++}`);
    values.push(data.lastName);
  }
  if (fields.length === 0) {
    return false; // No fields to update
  }
  // Add user ID for WHERE clause
  values.push(data.id);
  const query = `UPDATE "user" SET ${fields.join(', ')} WHERE id = $${idx}`;
  const result = await pool.query(query, values);
  return (result.rowCount ?? 0) > 0;
}

// change user password with old password check
export async function changeUserPassword(data: ChangePasswordData): Promise<boolean> {
  // Get the current password hash from the database
  const result = await pool.query('SELECT password FROM "user" WHERE id = $1', [data.id]);
  if ((result.rowCount ?? 0) === 0) {
    throw new Error('User not found');
  }
  const currentHash = result.rows[0].password;
  // Check if the old password matches the current hash
  const isMatch = await bcrypt.compare(data.oldPassword, currentHash);
  if (!isMatch) {
    throw new Error('password is incorrect');
  }
  // Hash the new password
  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
  // Update the password in the database
  const updateResult = await pool.query('UPDATE "user" SET password = $1 WHERE id = $2', [
    newHashedPassword,
    data.id,
  ]);
  return (updateResult.rowCount ?? 0) > 0; // Return true if the update was successful
}

// delete user by ID
export async function deleteUserById(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0; // Return true if at least one row was deleted
}
