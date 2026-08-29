import { connection } from './_env.js';
import { prompt, secret } from './_prompt.js';
import { hashPassword, passwordError } from '../src/lib/server/auth/password.js';
const email=(await prompt('Email: ')).toLowerCase(); const password=await secret('Password: '); const confirmation=await secret('Confirm password: ');
if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email.');
if (password!==confirmation) throw new Error('Passwords do not match.');
const issue=passwordError(password); if(issue) throw new Error(issue);
const hash=await hashPassword(password); const db=await connection();
try { await db.execute(`INSERT INTO admin_users(email,password_hash) VALUES(?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)`,[email,hash]); console.log(`Admin ready: ${email}`); } finally { await db.end(); }
