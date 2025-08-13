import { z } from 'zod';

/* ------------------------- applicationSchema helpers ------------------------- */

// Converts empty strings to undefined, trims strings otherwise.
// Useful for optional fields where "" should be treated as not set.

export const emptyToUndef = (val: unknown) =>
  typeof val === 'string' ? (val.trim() === '' ? undefined : val.trim()) : val;

/**
 * Preprocessor for date fields to normalize into YYYY-MM-DD format.
 * Returns undefined for empty values. Leaves invalid strings for regex to catch.
 */
export const toYYYYMMDD = z.preprocess(
  (val) => {
    const v = emptyToUndef(val);
    if (v === undefined) return undefined;
    const d = new Date(v as any);
    if (Number.isNaN(d.getTime())) return v; // Let regex fail
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date in YYYY-MM-DD'),
);

/* ------------------------- UserSchema helpers ------------------------- */

export const Name = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name is too long' });

//Password: at least 8 characters, max 72 characters (bcrypt safe limit)
export const Password = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(72, { message: 'Password must be at most 72 characters long' });

//Email: trimmed, converted to lowercase, and validated with z.email().
//Uses pipe() in Zod v4 to chain string transformation and email check.
export const Email = z
  .string()
  .trim()
  .transform((s) => s.toLowerCase())
  .pipe(z.email({ message: 'Invalid email address' }));
