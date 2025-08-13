import { z } from 'zod';
import { emptyToUndef, toYYYYMMDD } from '../helpers/zodHelpers.js';

/* ------------------------- Application Schema Definitions ------------------------- */

const baseApplicationShape = {
  job_title: z.preprocess(emptyToUndef, z.string().min(1).max(200)).optional(),
  company: z.preprocess(emptyToUndef, z.string().min(1).max(200)).optional(),
  contact_name: z.preprocess(emptyToUndef, z.string().min(1).max(200)).optional(),
  contact_email: z.preprocess(emptyToUndef, z.string().email().max(320)).optional(),
  contact_phone: z.preprocess(emptyToUndef, z.string().max(50)).optional(),
  address: z.preprocess(emptyToUndef, z.string().max(300)).optional(),
  job_source: z.preprocess(emptyToUndef, z.string().max(200)).optional(),
  job_url: z.preprocess(emptyToUndef, z.string().url().max(1000)).optional(),
  salary: z
    .preprocess(
      (v) => (emptyToUndef(v) === undefined ? undefined : v),
      z.coerce.number().nonnegative(),
    )
    .optional(),
  // If you have strict enums in DB, replace with z.enum([...])
  work_model: z.preprocess(emptyToUndef, z.string().max(50)).optional(),
  start_date: toYYYYMMDD.optional(),
  application_deadline: toYYYYMMDD.optional(),
  status: z
    .preprocess(
      emptyToUndef,
      z.enum(['open', 'applied', 'interview', 'rejected', 'offer', 'contract', 'withdrawn']),
    )
    .optional(),
};

// Body for POST /applications
export const createApplicationSchema = z.object(baseApplicationShape).strict();

// Body for PATCH /applications/:id — all optional but require at least one key
export const updateApplicationSchema = z
  .object(baseApplicationShape)
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, 'At least one field to update must be provided');

// Route param :id -> positive integer
export const applicationIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();
