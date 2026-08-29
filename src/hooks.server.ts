import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
  try { event.locals.admin = await validateSession(event.cookies); }
  catch { event.locals.admin = null; }
  return resolve(event);
};
