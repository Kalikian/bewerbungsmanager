import { z } from 'zod';

/**
 * Ensures :applicationId is a positive integer.
 * Uses z.coerce to convert string to number, then checks if it's an integer and positive.
 */
export const appIdParamSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
});

/**
 * Ensures :attachmentId is a positive integer.
 * Same coercion logic as for applicationId.
 */
export const attachmentIdParamSchema = z.object({
  attachmentId: z.coerce.number().int().positive(),
});

/**
 * Parses ?includeDeleted=true|false (string or boolean)
 * - If omitted -> defaults later in controller to false
 * - If string, normalizes case-insensitively
 */
export const listQuerySchema = z.object({
  includeDeleted: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.toLowerCase() === 'true' : !!v)),
});
