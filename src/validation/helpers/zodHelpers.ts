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
