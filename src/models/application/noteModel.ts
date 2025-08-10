// src/models/noteModel.ts
import pool from '../../db/db.js';
import { Note, NewNote, UpdateNote } from '../../types/note.js';

/**
 * Returns all notes for an application owned by the given user.
 */
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

/**
 * Creates a note for an application if it belongs to the given user.
 * Uses a CTE to enforce ownership at insert time.
 */
export async function createNote(input: NewNote, userId: number): Promise<Note | null> {
  const query = `
    WITH owned AS (
      SELECT id FROM application
      WHERE id = $1 AND user_id = $2
    )
    INSERT INTO note (application_id, date, text)
    SELECT owned.id, COALESCE($3, DEFAULT), $4
    FROM owned
    RETURNING *;
  `;
  const values = [
    input.application_id,
    userId,
    input.date ?? null, // DB default handles null
    input.text,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] ?? null; // null if app not owned by user
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
