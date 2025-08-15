import pool from '../db/db.js';
import bcrypt from 'bcrypt';
import { mapUserDbRow } from '../utils/mappers.js';
import { NewUser, UserDB, LoginUser, UpdateUserName, ChangePasswordData } from '../types/user.js';
import { UnauthorizedError, NotFoundError, ConflictError, BadRequestError } from '../errors.js';

// register new user
export async function registerUser(user: NewUser): Promise<number> {
  // Check if the email is already taken
  const check = await pool.query('SELECT id FROM "user" WHERE email = $1', [user.email]);

  if ((check.rowCount ?? 0) > 0) {
    //Throw a typed HttpError so the errorHandler returns 409
    throw new ConflictError('User with this email is already registered');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(user.password, 10);

  // Insert the new user into the database
  const result = await pool.query(
    'INSERT INTO "user" (email, password, first_name, last_name) VALUES ($1 ,$2, $3, $4) RETURNING id',
    [user.email, hashedPassword, user.firstName, user.lastName],
  );

  // Return the new user's id
  return result.rows[0].id;
}

// login user
export async function loginUser(credentials: LoginUser): Promise<number> {
  // Check if the user exists
  const result = await pool.query('SELECT id, password FROM "user" WHERE email = $1', [
    credentials.email,
  ]);

  const user = result.rows[0] as UserDB | undefined;

  if (!user) {
    //UnauthorizedError
    throw new UnauthorizedError();
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) {
    //Same 401 for wrong password
    throw new UnauthorizedError();
  }

  // Return the user's id
  return user.id;
}

// get user profile by id
export async function getUserById(id: number): Promise<Omit<UserDB, 'password'>> {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name FROM "user" WHERE id = $1',
    [id],
  );

  if ((result.rowCount ?? 0) === 0) {
    //NotFoundError returns 404
    throw new NotFoundError('User not found');
  }

  return mapUserDbRow(result.rows[0]);
}

// update user profile
export async function updateUserName(data: UpdateUserName): Promise<boolean> {
  //Build a dynamic partial update but avoid `any`
  const fields: string[] = [];
  const values: Array<string | number> = [];
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
    //Instead of returning false (ambiguous), throw a 400 to tell the client the request is invalid
    throw new BadRequestError('No fields provided to update');
  }

  // Add user ID for WHERE clause
  values.push(data.id);
  const query = `UPDATE "user" SET ${fields.join(', ')} WHERE id = $${idx}`;
  const result = await pool.query(query, values);

  if ((result.rowCount ?? 0) === 0) {
    //NotFoundError 404 when user ID does not exist
    throw new NotFoundError('User not found');
  }

  return true; //We only reach this on success
}

// change user password with old password check
export async function changeUserPassword(data: ChangePasswordData): Promise<boolean> {
  // Get the current password hash from the database
  const result = await pool.query('SELECT password FROM "user" WHERE id = $1', [data.id]);

  if ((result.rowCount ?? 0) === 0) {
    throw new NotFoundError('User not found');
  }

  const currentHash = result.rows[0].password;

  // Check if the old password matches the current hash
  const isMatch = await bcrypt.compare(data.oldPassword, currentHash);
  if (!isMatch) {
    throw new UnauthorizedError('Old password is incorrect');
  }

  // Hash the new password
  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

  // Update the password in the database
  const updateResult = await pool.query('UPDATE "user" SET password = $1 WHERE id = $2', [
    newHashedPassword,
    data.id,
  ]);

  if ((updateResult.rowCount ?? 0) === 0) {
    throw new NotFoundError('User not found');
  }

  return true; //Only return true when update actually succeeded
}

// delete user by ID
export async function deleteUserById(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM "user" WHERE id = $1', [id]);

  if ((result.rowCount ?? 0) === 0) {
    throw new NotFoundError('User not found');
  }

  return true; //Only success path returns true
}
