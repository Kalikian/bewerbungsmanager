import { pgTable, serial, integer, text, timestamp, bigint, index } from 'drizzle-orm/pg-core';
import { application } from './application.js';

/** Binary attachments metadata for an application */
export const attachment = pgTable(
  'attachment',
  {
    id: serial('id').primaryKey(),

    // required & cascades with application
    application_id: integer('application_id')
      .notNull()
      .references(() => application.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    filename_original: text('filename_original').notNull(),
    mime_type: text('mime_type').notNull(),
    size_bytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    storage_key: text('storage_key').notNull(),
    checksum_sha256: text('checksum_sha256').notNull(),

    uploaded_at: timestamp('uploaded_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [index('attachment_app_idx').on(t.application_id)],
);
