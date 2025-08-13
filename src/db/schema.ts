import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  date,
  bigint,
  numeric,
} from 'drizzle-orm/pg-core';

// User-Tabelle
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  first_name: varchar('first_name', { length: 100 }),
  last_name: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Application-Tabelle
export const application = pgTable('application', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => user.id),
  job_title: varchar('job_title', { length: 255 }),
  company: varchar('company', { length: 255 }),
  contact_name: varchar('contact_name', { length: 255 }),
  contact_email: varchar('contact_email', { length: 255 }),
  contact_phone: varchar('contact_phone', { length: 50 }),
  address: varchar('address', { length: 255 }),
  job_source: varchar('job_source', { length: 255 }),
  job_url: varchar('job_url', { length: 512 }),
  salary: numeric('salary', { precision: 12, scale: 2 }),
  work_model: varchar('work_model', { length: 50 }),
  start_date: date('start_date'),
  application_deadline: date('application_deadline'),
  status: varchar('status', { length: 50 }),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Note-Tabelle
export const note = pgTable('note', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id')
    .notNull()
    .references(() => application.id),
  date: date('date').notNull().defaultNow(), // default: CURRENT_DATE
  text: text('text').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(), // default: NOW()
  updated_at: timestamp('updated_at'), // nullable (wird beim Editieren gefüllt)
});

// Attachment-Tabelle (final)
export const attachment = pgTable('attachment', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id')
    .references(() => application.id, { onDelete: 'cascade' })
    .notNull(),
  filename_original: text('filename_original').notNull(),
  mime_type: text('mime_type').notNull(),
  size_bytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  storage_key: text('storage_key').notNull(),
  checksum_sha256: text('checksum_sha256').notNull(),
  uploaded_at: timestamp('uploaded_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

// Timeline-Tabelle
export const timeline = pgTable('timeline', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id').references(() => application.id),
  date: date('date'),
  event: varchar('event', { length: 255 }),
});
