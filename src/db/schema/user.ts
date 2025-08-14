import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

/** Core user entity */
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  first_name: varchar('first_name', { length: 100 }), // optional
  last_name: varchar('last_name', { length: 100 }), // optional
  email: varchar('email', { length: 255 }).notNull().unique(), // required
  password: varchar('password', { length: 255 }).notNull(), // required
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
});
