import 'dotenv/config';
import mysql from 'mysql2/promise';
export function dbConfig(multipleStatements=false) {
  if (process.env.DATABASE_URL) return { uri: process.env.DATABASE_URL, multipleStatements };
  return { host:process.env.DB_HOST??'127.0.0.1',port:Number(process.env.DB_PORT??3306),user:process.env.DB_USER??'westin_dev',password:process.env.DB_PASSWORD??'',database:process.env.DB_NAME??'westin_site',multipleStatements };
}
export async function connection(multipleStatements=false) { return mysql.createConnection(dbConfig(multipleStatements)); }
