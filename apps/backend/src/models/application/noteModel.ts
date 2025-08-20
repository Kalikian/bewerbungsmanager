import pool from '../../db/db.js';
import { Note, NewNote, UpdateNote } from '../../types/application/note.js';
import { NotFoundError, BadRequestError } from '../../errors.js';

/**
 * Return all notes for an application owned by the given user.
 * - CHANGED: First verify ownership/existence of the application to distinguish
 *   "no notes yet" (200 + []) from "application not found/not owned" (404).
 */
export async function getNotesForApplication(
  applicationId: number,
  userId: number,
): Promise<Note[]> {
  const owned = await pool.query('SELECT 1 FROM application WHERE id = $1 AND user_id = $2', [
    applicationId,
    userId,
  ]);
  if ((owned.rowCount ?? 0) === 0) {
    throw new NotFoundError('Application not found');
  }

  const query = `
    SELECT n.*
    FROM note n
    WHERE n.application_id = $1
    ORDER BY n.date DESC, n.id DESC;
  `;
  const { rows } = await pool.query(query, [applicationId]);
  return rows as Note[];
}

/**
 * Create a new note for an application owned by the given user.
 * - CHANGED: Throw NotFoundError(404) when application is not owned / not found
 *   instead of returning null. On success, always return the created note.
 */
export async function createNote(
  applicationId: number,
  userId: number,
  input: { date: string | null; text: string },
): Promise<Note> {
  const query = `
    WITH owned AS (
      SELECT id FROM application
      WHERE id = $1 AND user_id = $2
    )
    INSERT INTO note (application_id, date, text)
    SELECT owned.id, COALESCE($3::timestamptz, NOW()), $4
    FROM owned
    RETURNING *;
  `;
  const values: Array<number | string | null> = [applicationId, userId, input.date, input.text];
  const { rows } = await pool.query(query, values);

  if (!rows[0]) {
    throw new NotFoundError('Application not found');
  }
  return rows[0] as Note;
}

/**
 * Update a note if it belongs to an application owned by the given user.
 * - CHANGED: Throw BadRequestError(400) when no updatable fields are provided.
 * - CHANGED: Throw NotFoundError(404) when note doesn't exist or isn't owned.
 * - On success, return the updated note (no nulls).
 */
export async function updateNote(update: UpdateNote, userId: number): Promise<Note> {
  const { id, ...rawFields } = update;

  const entries = Object.entries(rawFields).filter(([, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new BadRequestError('No fields provided to update');
  }

  // build SET clause starting at $3 (since $1=noteId, $2=userId)
  const setClause = entries.map(([key], idx) => `"${key}" = $${idx + 3}`).join(', ');

  const values = entries.map(([, v]) => v ?? null) as Array<string | number | Date | null>;
  values.unshift(userId); // becomes $2
  values.unshift(id); // becomes $1

  const query = `
    UPDATE note n
    SET ${setClause}, updated_at = NOW()
    FROM application a
    WHERE n.id = $1
      AND n.application_id = a.id
      AND a.user_id = $2
    RETURNING n.*;
  `;
  const { rows } = await pool.query(query, values);

  if (!rows[0]) {
    throw new NotFoundError('Note not found');
  }

  return rows[0] as Note;
}

/**
 * Delete a note if it belongs to an application owned by the given user.
 * - CHANGED: Throw NotFoundError(404) instead of returning boolean false.
 * - On success, return void (errors are signaled via exceptions).
 */
export async function deleteNote(noteId: number, userId: number): Promise<void> {
  const query = `
    DELETE FROM note n
    USING application a
    WHERE n.id = $1
      AND n.application_id = a.id
      AND a.user_id = $2;
  `;
  const { rowCount } = await pool.query(query, [noteId, userId]);

  if ((rowCount ?? 0) === 0) {
    throw new NotFoundError('Note not found');
  }
}
