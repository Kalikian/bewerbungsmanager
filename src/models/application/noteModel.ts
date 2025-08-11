import pool from '../../db/db.js';
import { Note, NewNote, UpdateNote } from '../../types/application/note.js';

// Returns all notes for an application owned by the given user.

export async function getNotesForApplication(
  applicationId: number,
  userId: number,
): Promise<Note[]> {
  const query = `
    SELECT n.*
    FROM note n
    JOIN application a ON a.id = n.application_id
    WHERE a.id = $1 AND a.user_id = $2
    ORDER BY n.date DESC, n.id DESC;
  `;
  const { rows } = await pool.query(query, [applicationId, userId]);
  return rows;
}

// Creates a new note for an application owned by the given user.
export async function createNote(
  applicationId: number,
  userId: number,
  input: { date: string | null; text: string },
): Promise<Note | null> {
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
  const values = [applicationId, userId, input.date, input.text];
  const { rows } = await pool.query(query, values);
  return rows[0] ?? null;
}

/**
 * Updates a note if it belongs to an application owned by the given user.
 * Only updates provided fields and stamps updated_at.
 */
export async function updateNote(update: UpdateNote, userId: number): Promise<Note | null> {
  const { id, ...fields } = update;

  // Collect only defined fields
  const keys = Object.keys(fields).filter((k) => (fields as any)[k] !== undefined);

  if (keys.length === 0) {
    return null; // nothing to update
  }

  // Build dynamic SET clause and values
  const setClause = keys.map((k, idx) => `"${k}" = $${idx + 3}`).join(', ');
  const values: (string | number | Date | null)[] = keys.map((k) => (fields as any)[k] ?? null);

  // Always bump updated_at
  const query = `
    UPDATE note n
    SET ${setClause}, updated_at = now()
    FROM application a
    WHERE n.id = $1
      AND n.application_id = a.id
      AND a.user_id = $2
    RETURNING n.*;
  `;

  values.unshift(userId); // becomes $2
  values.unshift(id); // becomes $1

  const { rows } = await pool.query(query, values);
  return rows[0] ?? null;
}

/**
 * Deletes a note if it belongs to an application owned by the given user.
 * Returns true if a row was deleted, false otherwise.
 */
export async function deleteNote(noteId: number, userId: number): Promise<boolean> {
  const query = `
    DELETE FROM note n
    USING application a
    WHERE n.id = $1
      AND n.application_id = a.id
      AND a.user_id = $2;
  `;
  const { rowCount } = await pool.query(query, [noteId, userId]);
  return (rowCount ?? 0) > 0;
}
