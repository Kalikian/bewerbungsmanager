import { z } from 'zod';
import { emptyToUndef } from '../helpers/zodHelpers.js';

/* ------------------------- Constants / Limits ------------------------- */
export const FILENAME_MAX = 255 as const;
export const MIME_MAX = 255 as const;
export const STORAGE_KEY_MAX = 500 as const;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // adjust to your policy (50 MB)
export const SHA256_HEX = /^[a-f0-9]{64}$/i;

/* ------------------------- Optional base (for PATCH / internal reuse) ------------------------- */
/**
 * All fields optional; empty strings become undefined.
 * Use this shape for PATCH or internal reuse. For CREATE we override required fields.
 */
const baseAttachmentShapeOptional = {
  filename_original: z.preprocess(
    emptyToUndef,
    z.string().trim().min(1).max(FILENAME_MAX).optional(),
  ),
  mime_type: z.preprocess(emptyToUndef, z.string().trim().min(1).max(MIME_MAX).optional()),
  size_bytes: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().nonnegative().max(MAX_UPLOAD_BYTES).optional(),
  ),
  storage_key: z.preprocess(emptyToUndef, z.string().trim().min(1).max(STORAGE_KEY_MAX).optional()),
  checksum_sha256: z.preprocess(
    emptyToUndef,
    z.string().regex(SHA256_HEX, { message: 'Invalid sha256 hex' }).optional(),
  ),
} as const;

/* ------------------------- CREATE (POST /applications/:applicationId/attachments) ------------------------- */
/**
 * For create: require essential metadata.
 * If your controller generates `storage_key`, keep it optional here.
 * If not, make `storage_key` required by overriding like the other fields.
 */
export const createAttachmentSchema = z
  .object({
    ...baseAttachmentShapeOptional, // spread first …
    filename_original: z.string().trim().min(1).max(FILENAME_MAX), // … then override as required
    mime_type: z.string().trim().min(1).max(MIME_MAX),
    size_bytes: z.coerce.number().int().nonnegative().max(MAX_UPLOAD_BYTES),
    checksum_sha256: z.string().regex(SHA256_HEX, { message: 'Invalid sha256 hex' }),
  })
  .strict();

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;

/* ------------------------- LIST QUERY (?includeDeleted=) ------------------------- */
/**
 * Parses ?includeDeleted=true|false (string or boolean).
 * If omitted, controller can default to false.
 */
export const listAttachmentQuerySchema = z
  .object({
    includeDeleted: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((v) => (typeof v === 'string' ? v.toLowerCase() === 'true' : !!v)),
  })
  .strict();

export type ListAttachmentQuery = z.infer<typeof listAttachmentQuerySchema>;

/* ------------------------- Route params :applicationId ------------------------- */
/**
 * Used by:
 *   - GET  /applications/:applicationId/attachments
 *   - POST /applications/:applicationId/attachments
 */
export const attachmentApplicationIdParamSchema = z
  .object({
    applicationId: z.coerce.number().int().positive(),
  })
  .strict();

export type AttachmentApplicationIdParams = z.infer<typeof attachmentApplicationIdParamSchema>;

/* Back-compat alias if you already used `appIdParamSchema` elsewhere */
//export const appIdParamSchema = attachmentApplicationIdParamSchema;

/* ------------------------- Route params :attachmentId ------------------------- */
/**
 * Used by:
 *   - DELETE /applications/attachments/:attachmentId
 *   - (optionally) GET / download / restore routes
 */
export const attachmentIdParamSchema = z
  .object({
    attachmentId: z.coerce.number().int().positive(),
  })
  .strict();

export type AttachmentIdParams = z.infer<typeof attachmentIdParamSchema>;
