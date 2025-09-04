import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  date,
  numeric,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './user.js';

/** Enum persisted in DB (CREATE TYPE … AS ENUM …) */
export const applicationStatus = pgEnum('application_status', [
  'open',
  'applied',
  'interview',
  'rejected',
  'offer',
  'contract',
  'withdrawn',
]);

/** Job application belonging to a user */
export const application = pgTable(
  'application',
  {
    id: serial('id').primaryKey(),

    // required owner; cascade deletes applications when user is deleted
    user_id: integer('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // required core fields (aligned with your Zod "create" schema)
    job_title: varchar('job_title', { length: 200 }).notNull(),
    company: varchar('company', { length: 200 }).notNull(),

    // optional details (lengths aligned to validation)
    contact_name: varchar('contact_name', { length: 200 }),
    contact_email: varchar('contact_email', { length: 320 }),
    contact_phone: varchar('contact_phone', { length: 50 }),
    address: varchar('address', { length: 300 }),
    job_source: varchar('job_source', { length: 200 }),

    // must be a full URL per API, but optional to store
    job_url: varchar('job_url', { length: 1000 }),

    // consider storing cents as integer if you want numeric in code without strings
    salary: numeric('salary', { precision: 12, scale: 2 }),

    work_model: varchar('work_model', { length: 50 }),

    start_date: date('start_date'),
    application_deadline: date('application_deadline'),
    applied_date: date('applied_date'),

    // required; DB-level enum + default
    status: applicationStatus('status').notNull().default('open'),

    created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  },
  (t) => [index('application_user_idx').on(t.user_id)],
);
