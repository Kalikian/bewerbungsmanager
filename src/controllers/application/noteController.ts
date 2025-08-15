import type { Request, Response, NextFunction } from 'express';
import * as noteModel from '../../models/application/noteModel.js';
import { UnauthorizedError } from '../../errors.js';
import {
  createNoteSchema,
  updateNoteSchema,
  notesApplicationIdParamSchema,
  noteIdParamSchema,
} from '../../validation/application/noteSchema.js';

/* ---------------------------- Controller functions ---------------------------- */

/**
 * Get all notes for an application owned by the authenticated user.
 * - Requires authentication (req.user.id).
 * - Validates :applicationId with Zod.
 * - Model throws NotFoundError(404) if the application is not found / not owned.
 */
export async function getNotesForApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { applicationId } = notesApplicationIdParamSchema.parse(req.params);

    const notes = await noteModel.getNotesForApplication(applicationId, userId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new note for an application owned by the authenticated user.
 * - Requires authentication.
 * - Validates :applicationId (params) and body with Zod.
 * - `createNoteSchema` enforces non-empty `text` and normalizes optional `date`.
 * - Model throws NotFoundError(404) if the application is not found / not owned.
 * - Returns 201 + created note on success.
 */
export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { applicationId } = notesApplicationIdParamSchema.parse(req.params);
    const body = createNoteSchema.parse(req.body);

    const note = await noteModel.createNote(applicationId, userId, {
      // Model casts `date` to timestamptz on INSERT; pass null to use DB default (NOW()).
      date: body.date ?? null,
      text: body.text,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

/**
 * Partially update an existing note (owned by the authenticated user).
 * - Requires authentication.
 * - Validates body with Zod (`updateNoteSchema` requires `id` and at least one of {date, text}).
 * - Convert normalized date string to Date for consistent timestamptz handling.
 * - Model throws:
 *    - BadRequestError(400) if no updatable fields provided (defensive),
 *    - NotFoundError(404) if note is not found / not owned.
 * - Returns 200 + updated note on success.
 */
export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { id, date, text } = updateNoteSchema.parse(req.body);

    const updated = await noteModel.updateNote(
      {
        id,
        // Zod normalized the date string (YYYY-MM-DD); convert to Date for UPDATE to avoid implicit casts.
        date: date ? new Date(date) : undefined,
        text,
      },
      userId,
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a note owned by the authenticated user.
 * - Requires authentication.
 * - Validates :noteId with Zod.
 * - Model throws NotFoundError(404) when nothing was deleted.
 * - Returns 204 No Content on success.
 */
export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { noteId } = noteIdParamSchema.parse(req.params);

    await noteModel.deleteNote(noteId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
