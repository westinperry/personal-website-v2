import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connection } from './_env.js';

const db = await connection(true);
try {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  const [done] = await db.query('SELECT name FROM schema_migrations');
  const applied = new Set((done as {name:string}[]).map((r)=>r.name));
  const files = (await readdir(resolve('database/migrations'))).filter((f)=>/^\d+.*\.sql$/.test(f)).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(resolve('database/migrations',file),'utf8');
    await db.beginTransaction();
    try { await db.query(sql); await db.execute('INSERT INTO schema_migrations (name) VALUES (?)',[file]); await db.commit(); console.log(`Applied ${file}`); }
    catch (error) { await db.rollback(); throw error; }
  }
  console.log('Database is up to date.');
} finally { await db.end(); }
