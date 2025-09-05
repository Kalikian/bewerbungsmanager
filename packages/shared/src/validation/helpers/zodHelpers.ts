import { z } from 'zod';

/* ------------------------- applicationSchema helpers ------------------------- */

// Converts empty strings to undefined, trims strings otherwise.
// Useful for optional fields where "" should be treated as not set.

export const emptyToUndef = (val: unknown) =>
  typeof val === 'string' ? (val.trim() === '' ? undefined : val.trim()) : val;

export const emptyToNull = (v: unknown) => (v === '' || v === null ? null : v);

/**
 * Preprocessor for date fields to normalize into YYYY-MM-DD format.
 * Returns undefined for empty values. Leaves invalid strings for regex to catch.
 */
export const toYYYYMMDD = z.preprocess(
  (val) => {
    const v = emptyToUndef(val);
    // allow empty → undefined (optional)
    if (v === undefined) return undefined;
    // accept only already-correct strings from <input type="date">
    if (typeof v === 'string') return v.trim();
    // any other type will fail the regex below
    return v;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date in YYYY-MM-DD'),
);
