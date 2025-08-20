import { pgTable, serial, integer, date, varchar, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { application } from './application.js';

/** Event timeline for an application (kept for future use) */
export const timeline = pgTable(
  'timeline',
  {
    id: serial('id').primaryKey(),
    application_id: integer('application_id')
      .notNull()
      .references(() => application.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    date: date('date').default(sql`CURRENT_DATE`),
    event: varchar('event', { length: 255 }),
  },
  (t) => [index('timeline_app_idx').on(t.application_id)],
);
