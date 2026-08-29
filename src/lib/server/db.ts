import 'dotenv/config';
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';

let pool: Pool | undefined;

function options() {
  if (process.env.DATABASE_URL) return { uri: process.env.DATABASE_URL };
  return {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'westin_dev',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'westin_site'
  };
}

export function getPool(): Pool {
  if (!pool) {
    const config = options();
    pool = 'uri' in config
      ? mysql.createPool({ uri: config.uri, waitForConnections: true, connectionLimit: 10, timezone: 'Z' })
      : mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10, timezone: 'Z' });
  }
  return pool;
}

export async function rows<T extends RowDataPacket>(sql: string, values: unknown[] = []): Promise<T[]> {
  const [result] = await getPool().execute<T[]>(sql, values as never[]);
  return result;
}

export async function execute(sql: string, values: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values as never[]);
  return result;
}
