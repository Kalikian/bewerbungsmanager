import { z } from 'zod';

/* ------------------------- Reusable field definitions ------------------------- */

const Name = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name is too long' });

//Password: at least 8 characters, max 72 characters (bcrypt safe limit)
const Password = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(72, { message: 'Password must be at most 72 characters long' });

//Email: trimmed, converted to lowercase, and validated with z.email().
//Uses pipe() in Zod v4 to chain string transformation and email check.
const Email = z
  .string()
  .trim()
  .transform((s) => s.toLowerCase())
  .pipe(z.email({ message: 'Invalid email address' }));

/* ------------------------------ Body Schemas ------------------------------ */

//User ID from route params: coerces string to number, must be positive integer.
export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Invalid user id' }),
});

// Register a new user
export const registerUserSchema = z.object({
  email: Email,
  password: Password,
  firstName: Name,
  lastName: Name,
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// Login user
export const loginUserSchema = z.object({
  email: Email,
  password: Password,
});
export type LoginUserInput = z.infer<typeof loginUserSchema>;

//Schema for updating user's first and/or last name.
//At least one field must be provided.
export const updateUserNameSchema = z
  .object({
    firstName: Name.optional(),
    lastName: Name.optional(),
  })
  .refine((data) => !!data.firstName || !!data.lastName, {
    message: 'At least one field must be provided',
    path: ['firstName'], // Error will be attached to firstName by default
  });
export type UpdateUserNameInput = z.infer<typeof updateUserNameSchema>;

//Schema for changing user password.
//Both old and new passwords must meet the password requirements.
//The new password must be different from the old one.
export const changeUserPasswordSchema = z
  .object({
    oldPassword: Password,
    newPassword: Password,
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });
export type ChangeUserPasswordInput = z.infer<typeof changeUserPasswordSchema>;
