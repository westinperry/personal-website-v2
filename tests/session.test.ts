import {describe,expect,it} from 'vitest';import {tokenHash} from '../src/lib/server/auth/session';
describe('session tokens',()=>{it('stores deterministic SHA-256 hashes, not raw tokens',()=>{const token='private-token';const hash=tokenHash(token);expect(hash).toHaveLength(64);expect(hash).not.toContain(token);expect(tokenHash(token)).toBe(hash);});});
