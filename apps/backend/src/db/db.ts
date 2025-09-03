import { Pool, types } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

// 1082 = DATE, 1114 = TIMESTAMP, 1184 = TIMESTAMPTZ
types.setTypeParser(1082, (v) => v); // 'YYYY-MM-DD' as string
types.setTypeParser(1114, (v) => v); // keep timestamp as string
types.setTypeParser(1184, (v) => v); // keep timestamptz as string

export default pool;
