import type { UserDB } from '@bewerbungsmanager/shared';

// Utility to map a single DB user (snake_case) to a TS User (camelCase)
export function mapUserDbRow(row: any): Omit<UserDB, 'password'> {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}
