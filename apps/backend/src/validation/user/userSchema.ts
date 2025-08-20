import { z } from 'zod';
import { emptyToUndef } from '../helpers/zodHelpers.js';

/* ------------------------- Constants / Limits ------------------------- */
export const NAME_MAX = 100 as const;
export const PASSWORD_MIN = 8 as const;
export const PASSWORD_MAX = 72 as const; // bcrypt safe limit
export const EMAIL_MAX = 320 as const;

/* ------------------------- Reusable validators ------------------------- */
/**
 * Names: trimmed, non-empty, limited length.
 */
const Name = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(NAME_MAX, { message: 'Name is too long' });

/**
 * Password: 8..72 chars (bcrypt safe).
 */
const Password = z
  .string()
  .min(PASSWORD_MIN, { message: `Password must be at least ${PASSWORD_MIN} characters long` })
  .max(PASSWORD_MAX, { message: `Password must be at most ${PASSWORD_MAX} characters long` });

/**
 * Email: trim → lowercase → validate with z.email() (Zod v4: pipe()).
 */
const Email = z
  .string()
  .trim()
  .max(EMAIL_MAX, { message: 'Email too long' })
  .transform((s) => s.toLowerCase())
  .pipe(z.email({ message: 'Invalid email address' }));

/* ------------------------- Optional base (for PATCH) ------------------------- */
/**
 * All fields optional; empty strings become undefined (not considered "set").
 */
const baseUserNameShapeOptional = {
  firstName: z.preprocess(emptyToUndef, Name.optional()),
  lastName: z.preprocess(emptyToUndef, Name.optional()),
} as const;

/* ------------------------- CREATE (POST /user/register) ------------------------- */
/**
 * For create/register: all fields required.
 * Using spread+override keeps style consistent with applicationSchema.
 */
export const createUserSchema = z
  .object({
    ...baseUserNameShapeOptional, // spread first …
    email: Email, // … then override as required
    password: Password,
    firstName: Name,
    lastName: Name,
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

/* Back-compat alias if you already import `registerUserSchema` elsewhere */
export const registerUserSchema = createUserSchema;

/* ------------------------- LOGIN (POST /user/login) ------------------------- */
export const loginUserSchema = z
  .object({
    email: Email,
    password: Password,
  })
  .strict();

export type LoginUserInput = z.infer<typeof loginUserSchema>;

/* ------------------------- UPDATE (PATCH /user/name) ------------------------- */
/**
 * For update: both fields optional, BUT at least one must be provided (defined).
 * Thanks to emptyToUndef, `{ firstName: "" }` is treated as undefined and will not pass.
 */
export const updateUserNameSchema = z
  .object(baseUserNameShapeOptional)
  .strict()
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

export type UpdateUserNameInput = z.infer<typeof updateUserNameSchema>;

/* ------------------------- CHANGE PASSWORD (POST /user/change-password) ------------------------- */
/**
 * Both passwords must satisfy the password policy and be different.
 */
export const changeUserPasswordSchema = z
  .object({
    oldPassword: Password,
    newPassword: Password,
  })
  .strict()
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });

export type ChangeUserPasswordInput = z.infer<typeof changeUserPasswordSchema>;

/* ------------------------- Route param :id ------------------------- */
export const userIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive({ message: 'Invalid user id' }),
  })
  .strict();
