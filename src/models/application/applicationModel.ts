import pool from '../../db/db.js';
import { NewApplication, Application, UpdateApplication } from '../../types/application.js';

// Creates a new job application in the database
export async function createApplication(application: NewApplication) {
  const query = `
    INSERT INTO application (
      user_id, job_title, company, contact_name, contact_email, contact_phone,
      address, job_source, job_url, salary, work_model, start_date,
      application_deadline, status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING *;
  `;

  const values = [
    application.user_id,
    application.job_title ?? null,
    application.company ?? null,
    application.contact_name ?? null,
    application.contact_email ?? null,
    application.contact_phone ?? null,
    application.address ?? null,
    application.job_source ?? null,
    application.job_url ?? null,
    application.salary ?? null,
    application.work_model ?? null,
    application.start_date ?? null,
    application.application_deadline ?? null,
    application.status ?? 'open', // Default Status
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Retrieves all applications for a specific user
export async function getApplications(userId: number): Promise<Application[]> {
  const query = `
    SELECT *
    FROM application
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const values = [userId];
  const { rows } = await pool.query(query, values);
  return rows;
}

// Dynamically build the SET clause depending on provided fields
export async function updateApplication(
  update: UpdateApplication,
  userId: number,
): Promise<Application | null> {
  const { id, ...fields } = update;

  // never allow changing user_id
  if ('user_id' in fields) {
    delete (fields as any).user_id;
  }

  // remove undefined fields
  const keys = Object.keys(fields).filter(
    (key) => fields[key as keyof typeof fields] !== undefined,
  );

  if (keys.length === 0) {
    // nothing to update
    return null;
  }

  // build SET clause; note placeholders start at $3 because $1=id, $2=userId
  const setClause = keys.map((key, idx) => `"${key}" = $${idx + 3}`).join(', ');

  const values: (string | number | Date | null)[] = keys.map((key) => (fields as any)[key] ?? null);

  // first two placeholders are reserved for id and userId
  values.unshift(userId);
  values.unshift(id);

  const query = `
    UPDATE application
    SET ${setClause}
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0] || null; // null => not found or not owned
}

export async function deleteApplication(id: number, userId: number): Promise<boolean> {
  const query = `
    DELETE FROM application
    WHERE id = $1 AND user_id = $2
  `;
  const values = [id, userId];

  const { rowCount } = await pool.query(query, values);

  // rowCount > 0 means a record was deleted
  return (rowCount ?? 0) > 0;
}
