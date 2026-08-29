import { secret } from './_prompt.js';
import { hashPassword, passwordError } from '../src/lib/server/auth/password.js';
const password=process.argv[2]??await secret('Password: '); const issue=passwordError(password); if(issue) throw new Error(issue); process.stdout.write(`${await hashPassword(password)}\n`);
