import dotenv from "dotenv";
import path from "path";
import { Pool, types } from "pg";
import type { PoolConfig } from "pg";

// Force-load the backend .env when running from the monorepo root.
// This keeps your scripts unchanged (yarn dev from root).
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

// Enable SSL only in production (Render requires SSL).
const isProd = process.env.NODE_ENV === 'production';

// Prefer a single DATABASE_URL if provided (common on PaaS).
const config: PoolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    // Render's managed Postgres usually needs TLS without CA validation.
    ssl: isProd ? { rejectUnauthorized: false } : undefined,
  }
  : {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    // Same SSL rule when using discrete env vars.
    ssl: isProd ? { rejectUnauthorized: false } : undefined,
  };

const pool = new Pool(config);

// 1082 = DATE, 1114 = TIMESTAMP, 1184 = TIMESTAMPTZ
types.setTypeParser(1082, (v) => v); // 'YYYY-MM-DD' as string
types.setTypeParser(1114, (v) => v); // keep timestamp as string
types.setTypeParser(1184, (v) => v); // keep timestamptz as string

export default pool;
