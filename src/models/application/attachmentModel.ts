import pool from '../../db/db.js';
import { AttachmentRow } from '../../types/application/attachment.js';

/**
 * Insert a new attachment for an application the user owns.
 * Returns the created row or null when the user is not the owner / app not found.
 */
export async function insertAttachment(input: {
  applicationId: number;
  userId: number;
  filenameOriginal: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  checksumSha256: string;
}): Promise<AttachmentRow | null> {
  const query = `
    WITH owned AS (
      SELECT id FROM application
      WHERE id = $1 AND user_id = $2
    )
    INSERT INTO attachment (
      application_id, filename_original, mime_type, size_bytes, storage_key, checksum_sha256
    )
    SELECT owned.id, $3, $4, $5, $6, $7
    FROM owned
    RETURNING *;
  `;
  const values = [
    input.applicationId,
    input.userId,
    input.filenameOriginal,
    input.mimeType,
    input.sizeBytes,
    input.storageKey,
    input.checksumSha256,
  ];
  const { rows } = await pool.query<AttachmentRow>(query, values);
  return rows[0] ?? null;
}

/**
 * Retrieves all attachments for an application owned by the user.
 * Optionally include soft-deleted attachments.
 */
export async function getAttachments(
  applicationId: number,
  userId: number,
  includeDeleted = false,
): Promise<AttachmentRow[]> {
  const query = `
    SELECT a.*
    FROM attachment a
    JOIN application app ON app.id = a.application_id
    WHERE a.application_id = $1
      AND app.user_id = $2
      AND ($3::boolean OR a.deleted_at IS NULL)
    ORDER BY a.uploaded_at DESC, a.id DESC;
  `;
  const values = [applicationId, userId, includeDeleted];
  const { rows } = await pool.query<AttachmentRow>(query, values);
  return rows;
}

// Retrieves a specific attachment by ID for an application owned by the user.
export async function getAttachmentById(
  attachmentId: number,
  userId: number,
): Promise<AttachmentRow | null> {
  const query = `
    SELECT a.*
    FROM attachment a
    JOIN application app ON app.id = a.application_id
    WHERE a.id = $1
      AND app.user_id = $2
      AND a.deleted_at IS NULL
    LIMIT 1;
  `;

  const values = [attachmentId, userId];

  const { rows } = await pool.query<AttachmentRow>(query, values);
  return rows[0] ?? null;
}

/**
 * Soft-delete an attachment (sets deleted_at) if it belongs to the user.
 * Returns true when a row was affected.
 */
export async function softDeleteAttachment(attachmentId: number, userId: number): Promise<boolean> {
  const query = `
    UPDATE attachment a
    SET deleted_at = now()
    FROM application app
    WHERE a.id = $1
      AND app.id = a.application_id
      AND app.user_id = $2
      AND a.deleted_at IS NULL
  `;
  const res = await pool.query(query, [attachmentId, userId]);
  return (res.rowCount ?? 0) > 0;
}

/**
 * Find a reusable storage_key for a given checksum (only among non-deleted rows).
 * Use this to deduplicate uploads (reuse existing physical file).
 * Returns null if none exists -> caller should store a new file.
 */
export async function findReusableStorageKeyByChecksum(
  checksumSha256: string,
): Promise<string | null> {
  const query = `
    SELECT storage_key
    FROM attachment
    WHERE checksum_sha256 = $1
      AND deleted_at IS NULL
    ORDER BY uploaded_at DESC, id DESC
    LIMIT 1;
  `;
  const { rows } = await pool.query<{ storage_key: string }>(query, [checksumSha256]);
  return rows[0]?.storage_key ?? null;
}
