import { z } from 'zod';
import { emptyToUndef, toYYYYMMDD } from '../helpers/zodHelpers.js';

/* ------------------------- Constants / Limits ------------------------- */
export const NOTE_TEXT_MAX = 4000 as const;

/* ------------------------- Optional base (for PATCH) ------------------------- */
/**
 * All fields optional; empty strings/null become undefined.
 * `date` is normalized to 'YYYY-MM-DD' when provided.
 */
const baseNoteShapeOptional = {
  date: z.preprocess(emptyToUndef, toYYYYMMDD?.optional()),
  text: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .min(1, { message: 'text must not be empty' })
      .max(NOTE_TEXT_MAX, { message: 'text too long' })
      .optional(),
  ),
} as const;

/* ------------------------- CREATE (POST /applications/:applicationId/notes) ------------------------- */
/**
 * For create: `text` is REQUIRED; `date` optional.
 * If `date` is omitted/empty, let DB default handle it.
 */
export const createNoteSchema = z
  .object({
    ...baseNoteShapeOptional, // spread first …
    text: z.preprocess(
      emptyToUndef,
      z.string().trim().min(1).max(NOTE_TEXT_MAX), // … then override as required
    ),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/* ------------------------- UPDATE (PATCH body) ------------------------- */
/**
 * For update: requires `id` and at least one of { date, text }.
 * Using values-scan ensures that `{ text: "" }` (→ undefined) does NOT pass.
 */
export const updateNoteSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    ...baseNoteShapeOptional,
  })
  .strict()
  .refine((obj) => obj.date !== undefined || obj.text !== undefined, {
    message: 'At least one of date or text must be provided',
  });

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/* ------------------------- Route params :applicationId ------------------------- */
/**
 * Used by:
 *   - GET  /applications/:applicationId/notes
 *   - POST /applications/:applicationId/notes
 */
export const notesApplicationIdParamSchema = z
  .object({
    applicationId: z.coerce.number().int().positive(),
  })
  .strict();

export type NotesApplicationIdParams = z.infer<typeof notesApplicationIdParamSchema>;

/* ------------------------- Route params :noteId ------------------------- */
/**
 * Used by:
 *   - DELETE /applications/notes/:noteId   (or your chosen route)
 *   - (optionally) GET one note by id
 */
export const noteIdParamSchema = z
  .object({
    noteId: z.coerce.number().int().positive(),
  })
  .strict();

export type NoteIdParams = z.infer<typeof noteIdParamSchema>;
