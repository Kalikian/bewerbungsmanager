import pool from '../../db/db.js';
import {
  NewApplication,
  Application,
  UpdateApplication,
} from '../../types/application/application.js';
import { NotFoundError, BadRequestError } from '../../errors.js';

// Creates a new job application in the database
export async function createApplication(application: NewApplication): Promise<Application> {
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
    application.status ?? 'open', // Default status if not provided
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] as Application;
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
  return rows as Application[];
}

// Retrieves a specific application by ID for a user
export async function getApplicationById(id: number, userId: number): Promise<Application> {
  const query = `
    SELECT *
    FROM application
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
  `;
  const { rows } = await pool.query(query, [id, userId]);

  if (!rows[0]) {
    throw new NotFoundError('Application not found');
  }

  return rows[0] as Application;
}

// Dynamically build the SET clause depending on provided fields
export async function updateApplication(
  update: UpdateApplication,
  userId: number,
): Promise<Application> {
  const { id, ...rawFields } = update;

  // never allow changing ownership via update
  if ('user_id' in rawFields) {
    // Remove user_id if it exists in the update
    delete (rawFields as Record<string, unknown>).user_id;
  }

  // remove undefined fields
  const entries = Object.entries(rawFields).filter(([, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new BadRequestError('No fields provided to update');
  }

  // build SET clause safely; placeholders start at $3 because $1=id, $2=userId
  const setClause = entries.map(([key], idx) => `"${key}" = $${idx + 3}`).join(', ');

  const values = entries.map(([, v]) => v ?? null) as Array<string | number | Date | null>;

  // First two placeholders are reserved for id and userId
  values.unshift(userId);
  values.unshift(id);

  const query = `
    UPDATE application
    SET ${setClause}
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);

  if (!rows[0]) {
    // when record not found (or not owned), throw 404
    throw new NotFoundError('Application not found');
  }

  return rows[0] as Application;
}

export async function deleteApplication(id: number, userId: number): Promise<void> {
  const query = `
    DELETE FROM application
    WHERE id = $1 AND user_id = $2
  `;
  const values = [id, userId];

  const { rowCount } = await pool.query(query, values);

  if ((rowCount ?? 0) === 0) {
    // explicit 404 when nothing was deleted
    throw new NotFoundError('Application not found');
  }
}
