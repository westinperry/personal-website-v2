import { createHash, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import { execute, rows } from '$lib/server/db';

const DAYS = 14;
export const cookieName = () => process.env.SESSION_COOKIE_NAME ?? 'westin_session';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(userId: number, cookies: Cookies) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + DAYS * 86400000);
  await execute('INSERT INTO admin_sessions (user_id,token_hash,expires_at) VALUES (?,?,?)', [userId, tokenHash(token), expires]);
  cookies.set(cookieName(), token, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires });
}

export async function validateSession(cookies: Cookies) {
  const token = cookies.get(cookieName());
  if (!token) return null;
  const found = await rows<RowDataPacket & { id:number; email:string }>(`SELECT u.id,u.email FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()`, [tokenHash(token)]);
  if (!found[0]) { await execute('DELETE FROM admin_sessions WHERE token_hash=? AND expires_at<=UTC_TIMESTAMP()', [tokenHash(token)]); cookies.delete(cookieName(), { path: '/' }); }
  return found[0] ?? null;
}

export async function destroySession(cookies: Cookies) {
  const token = cookies.get(cookieName());
  if (token) await execute('DELETE FROM admin_sessions WHERE token_hash=?', [tokenHash(token)]);
  cookies.delete(cookieName(), { path: '/' });
}
