import { z } from 'zod';
import { emptyToUndef, emptyToNull, toYYYYMMDD } from '../helpers/zodHelpers.js';

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

/* ------------------------- CREATE base (no nulls) ------------------------- */
/** CHANGE: Base für CREATE – optionale Felder: '' -> undefined (keine nulls) */
const baseCreateShape = {
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

/* ------------------------- UPDATE base (clearable) ------------------------- */
/** CHANGE: Base für UPDATE – optionale Felder: '' -> null (löschen erlaubt) */
const baseUpdateShape = {
  // Hinweis: job_title & company beim Update nicht nullbar (UI erzwingt Pflicht),
  // leer lassen bedeutet: kein Update. Wenn du sie auch löschbar willst, analog unten auf nullbar stellen.
  job_title: z.preprocess(emptyToUndef, z.string().min(1).max(200).optional()),
  company: z.preprocess(emptyToUndef, z.string().min(1).max(200).optional()),

  contact_name: z.preprocess(
    emptyToNull,
    z.union([z.string().min(1).max(200), z.null()]).optional(),
  ),
  contact_email: z.preprocess(
    emptyToNull,
    z
      .union([
        z
          .string()
          .trim()
          .max(320, { message: 'Email too long' })
          .transform((s) => s.toLowerCase())
          .pipe(z.email({ message: 'Invalid email address' })),
        z.null(),
      ])
      .optional(),
  ),
  contact_phone: z.preprocess(emptyToNull, z.union([z.string().max(50), z.null()]).optional()),
  address: z.preprocess(emptyToNull, z.union([z.string().max(300), z.null()]).optional()),
  job_source: z.preprocess(emptyToNull, z.union([z.string().max(200), z.null()]).optional()),
  job_url: z.preprocess(
    emptyToNull,
    z
      .union([
        z.string().trim().max(1000, { message: 'URL too long' }).pipe(z.url({ message: 'Invalid URL' })),
        z.null(),
      ])
      .optional(),
  ),
  salary: z.preprocess(
    emptyToNull,
    z.union([z.coerce.number().nonnegative(), z.null()]).optional(),
  ),
  work_model: z.preprocess(emptyToNull, z.union([z.string().max(50), z.null()]).optional()),
  start_date: z.preprocess(emptyToNull, z.union([toYYYYMMDD, z.null()]).optional()),
  application_deadline: z.preprocess(emptyToNull, z.union([toYYYYMMDD, z.null()]).optional()),
  status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()),
} as const;

/* ------------------------- CREATE (POST /applications) ------------------------- */
/**
 * For create: job_title and company are REQUIRED.
 * status defaults to 'open' if omitted/empty.
 * CHANGE: nutzt baseCreateShape (keine nulls) -> crasht das Backend nicht.
 */
export const createApplicationSchema = z
  .object({
    ...baseCreateShape,
    job_title: z.preprocess(emptyToUndef, z.string().min(1).max(200)),
    company: z.preprocess(emptyToUndef, z.string().min(1).max(200)),
    status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()).transform((v) => v ?? 'open'),
  })
  .strict();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

/* ------------------------- UPDATE (PATCH /applications/:id) ------------------------- */
/**
 * For update: all fields optional, BUT at least one must be provided (with a defined value).
 * CHANGE: nutzt baseUpdateShape -> optionale Felder sind clearbar ('' -> null).
 */
export const updateApplicationSchema = z
  .object(baseUpdateShape)
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

