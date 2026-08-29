# westinperry.com

A server-rendered personal archive built with SvelteKit, Svelte 5, TypeScript, MySQL 8, and the Node adapter. Public pages contain photographs, a short Now page, an archival Log, and a personal About page. `/admin` is a server-authenticated editor for all site content.

## Prerequisites

- Node.js 22 or newer
- npm
- Docker with Docker Compose (for the local MySQL database)

## Local setup

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

Open `http://localhost:5173`. The seed is optional and clearly marks its Log and Elsewhere content as demo data. It installs ten local photo records across landscape, portrait, square, and panoramic ratios. Re-running it is safe for development.

The day-to-day commands are:

```bash
npm run check
npm run test
npm run test:e2e
npm run build
npm run preview
```

`npm run preview` runs the adapter-node output from `build/`. Run `npm run build` first. Playwright's public tests run without credentials; set `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` to include the protected CRUD/privacy workflow. Install its browser once with `npx playwright install chromium`.

To stop the local database without deleting its volume:

```bash
docker compose down
```

## Database

MySQL stores content and image metadata; it never stores image binaries. [`src/lib/server/db.ts`](src/lib/server/db.ts) owns a reusable `mysql2/promise` connection pool. Public repositories include `visibility = 'public'` in SQL, so private records and their metadata never enter public page data.

Versioned migrations live in [`database/migrations`](database/migrations). `npm run db:migrate` creates `schema_migrations`, runs unapplied SQL files in filename order, and records each successful migration. [`database/schema.sql`](database/schema.sql) is a clean first-install schema for phpMyAdmin and includes the matching `001_initial.sql` migration record, so the runner can safely continue with future migrations.

Connection configuration supports either `DATABASE_URL` or the separate `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` variables. Separate variables are preferred for Hostinger.

## Admin and authentication

Create or replace an administrator interactively:

```bash
npm run admin:create
```

Passwords must have at least 12 characters plus uppercase, lowercase, and a number. They are hashed with bcrypt and never logged. To generate only a bcrypt hash for a manual phpMyAdmin insert:

```bash
npm run admin:hash
```

The hash is written to stdout; prompts are written to the terminal separately. Avoid passing the optional password argument on shared systems because shell histories and process listings may expose it.

Login is checked entirely on the server with a generic failure message and basic per-address/email throttling. Session cookies are HttpOnly, SameSite=Lax, Secure in production, and expire after 14 days. The browser receives a random 256-bit token; MySQL stores only its SHA-256 hash. Every request validates the session against its expiry. Logout deletes both the row and cookie. Admin responses use `private, no-store` caching.

The local test account created during development verification is intentionally not part of a migration or seed; create your own with `npm run admin:create`.

## Photo storage

The local storage adapter is in [`src/lib/server/storage/index.ts`](src/lib/server/storage/index.ts). Its interface provides `save`, `delete`, `read`, and `getURL`, so an S3-compatible adapter can replace it without changing photo forms or database queries.

Uploads go to `UPLOAD_DIR` (default `./data/uploads`), which is gitignored. `/media/[key]` checks the photo row before reading the object: anonymous requests may fetch only public images, while authenticated admins may preview private ones. Uploads are limited by `MAX_UPLOAD_MB`, accept JPEG, PNG, and WebP, validate extension, declared MIME type, file signature, size, and empty content, and receive random storage names. Original filenames are metadata only. HEIC can be added later at the adapter/validation boundary without adding a fragile native dependency now.

The v1 adapter serves originals. Grids lazy-load images and use stored dimensions when known; heroes load eagerly. A future adapter can make `getURL` variant-aware (for example `getURL(key, { width: 1200 })`) to add generated thumbnails without changing gallery records.

To replace demo photography, sign in at `/admin`, upload your photographs, choose them under Site Settings, then delete the demo records. Deletion removes the database row first and then the object; any storage cleanup failure is logged and reported without resurrecting private metadata.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Optional full MySQL URL; overrides separate DB values |
| `DB_HOST` | MySQL hostname |
| `DB_PORT` | MySQL port, normally `3306` |
| `DB_USER` | Application database user |
| `DB_PASSWORD` | Application database password |
| `DB_NAME` | Database name |
| `PUBLIC_SITE_URL` | Canonical site origin |
| `UPLOAD_DIR` | Persistent image-object directory |
| `MAX_UPLOAD_MB` | Maximum upload size per file |
| `SESSION_COOKIE_NAME` | Session cookie name |

Never commit `.env`, production credentials, hashes, or tokens.

## Production / Hostinger notes

1. Use a Node.js 22-compatible Hostinger runtime and set all environment variables in the hosting control panel.
2. Create a MySQL 8 database/user. The host is commonly `localhost` when the app and database share the account, but use the value Hostinger provides.
3. Run `npm ci`, `npm run db:migrate`, and `npm run build` during deployment.
4. Start the application with `node build` (the same command behind `npm run preview`). Set `NODE_ENV=production` so the session cookie is Secure.
5. Point `UPLOAD_DIR` at a persistent, writable directory outside disposable release folders. Back up both MySQL and this directory together. If the hosting plan does not provide durable filesystem storage, implement an S3-compatible adapter before accepting production uploads.
6. Configure the proxy to pass the original protocol/host and terminate HTTPS. Do not expose the Vite development server or local Docker database in production.

Docker Compose is development-only. Production contains no localhost-only client API, embedded credential, or browser-side secret.

## Project map

- `src/routes` — public pages, protected admin, and controlled media endpoint
- `src/lib/server/repositories` — SQL boundary, including explicit public filters
- `src/lib/server/auth` — bcrypt, token sessions, and login throttling
- `src/lib/server/storage` — replaceable local object storage
- `database/migrations` — ordered database changes
- `scripts` — migration, seed, and admin utilities
- `tests` — Vitest security units and Playwright critical flows
- `static/demo` — generated development-only seed photographs
