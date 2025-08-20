import { pgTable, serial, integer, date, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { application } from './application.js';

/** Free-form notes attached to an application */
export const note = pgTable(
  'note',
  {
    id: serial('id').primaryKey(),

    // required & cascades with application
    application_id: integer('application_id')
      .notNull()
      .references(() => application.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // required; default is CURRENT_DATE for DATE columns
    date: date('date')
      .notNull()
      .default(sql`CURRENT_DATE`),

    // required text content
    text: text('text').notNull(),

    // required creation timestamp; updated_at is optional
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at'),
  },
  (t) => [index('note_app_idx').on(t.application_id)],
);
