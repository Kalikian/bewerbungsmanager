import { z } from 'zod';
import { emptyToUndef,emptyToNull, toYYYYMMDD } from '../helpers/zodHelpers.js';

/* ------------------------- Constants / Enums ------------------------- */
export const STATUSES = [
  'open',
  'applied',
  'interview',
  'rejected',
  'offer',
  'contract',
  'withdrawn',
] as const;

/* ------------------------- Optional base (for PATCH) ------------------------- */
/**
 * All fields optional; empty strings/null become undefined.
 * Email/URL use Zod v4 style (pipe to z.email/z.url).
 */
const baseApplicationShapeOptional = {
  job_title: z.preprocess(emptyToNull, z.string().min(1).max(200).optional()),
  company: z.preprocess(emptyToNull, z.string().min(1).max(200).optional()),
  contact_name: z.preprocess(emptyToUndef, z.string().min(1).max(200).optional()),
  contact_email: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .max(320, { message: 'Email too long' })
      .transform((s) => s.toLowerCase())
      .pipe(z.email({ message: 'Invalid email address' }))
      .optional(),
  ),
  contact_phone: z.preprocess(emptyToUndef, z.string().max(50).optional()),
  address: z.preprocess(emptyToUndef, z.string().max(300).optional()),
  job_source: z.preprocess(emptyToUndef, z.string().max(200).optional()),
  job_url: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .max(1000, { message: 'URL too long' })
      .pipe(z.url({ message: 'Invalid URL' }))
      .optional(),
  ),
  salary: z.preprocess(emptyToUndef, z.coerce.number().nonnegative().optional()),
  work_model: z.preprocess(emptyToUndef, z.string().max(50).optional()),
  start_date: z.preprocess(emptyToUndef, toYYYYMMDD?.optional()),
  application_deadline: z.preprocess(emptyToUndef, toYYYYMMDD?.optional()),
  status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()),
} as const;

/* ------------------------- CREATE (POST /applications) ------------------------- */
/**
 * For create: job_title and company are REQUIRED.
 * status defaults to 'open' if omitted/empty.
 */
export const createApplicationSchema = z
  .object({
    ...baseApplicationShapeOptional, // spread first …
    job_title: z.preprocess(emptyToUndef, z.string().min(1).max(200)), // … then override as required
    company: z.preprocess(emptyToUndef, z.string().min(1).max(200)),
    status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()).transform((v) => v ?? 'open'), // default only for create
  })
  .strict();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

/* ------------------------- UPDATE (PATCH /applications/:id) ------------------------- */
/**
 * For update: all fields optional, BUT at least one must be provided (with a defined value).
 * Using values-scan ensures that `{ job_title: "" }` (→ undefined) does NOT pass.
 */
export const updateApplicationSchema = z
  .object(baseApplicationShapeOptional )
  .strict()
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

/* ------------------------- Route param :id ------------------------- */
export const applicationIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();
