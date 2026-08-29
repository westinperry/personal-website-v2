const attempts = new Map<string, { count: number; reset: number }>();
const WINDOW = 15 * 60_000;
const MAX = 8;
export function loginAllowed(key: string) { const now=Date.now(); const item=attempts.get(key); if (!item || item.reset<now) { attempts.set(key,{count:0,reset:now+WINDOW}); return true; } return item.count<MAX; }
export function recordFailure(key: string) { const item=attempts.get(key) ?? {count:0,reset:Date.now()+WINDOW}; item.count++; attempts.set(key,item); }
export function clearFailures(key: string) { attempts.delete(key); }
