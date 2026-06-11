# Srsly Fit

[![CI](https://github.com/SeanKraemer/srsly-fit/actions/workflows/ci.yml/badge.svg)](https://github.com/SeanKraemer/srsly-fit/actions/workflows/ci.yml)

Srsly Fit is a full-stack workout planning and tracking app built with Next.js, React, NextAuth, and MySQL. It supports exercise search across a ~2,900-exercise catalog, workout templates with ordered exercises and sets, completion tracking, exercise-suggestion based on training history, and embedded demonstration videos.

Originated as a four-person team project for UIUC's CS 411 Database Systems graduate course (Summer 2025); this repository is my portfolio fork, reworked for safe public deployment. The database design artifacts are in [docs/](docs/).

**Live demo:** [https://srsly-fit.vercel.app](https://srsly-fit.vercel.app) — click **Continue as Demo User**. The demo is read-only: it runs on seeded fixtures with no live database, and every write path returns a friendly read-only message instead of mutating anything.

![Demo: demo login, dashboard, exercise search, workout editor with set tracking, and a blocked save showing the read-only demo guard](docs/demo.gif)

*One take: log in as the demo user, browse the dashboard, search exercises by keyword and muscle, open a workout template with sets, then attempt a save — blocked by the server-side demo guard with a clear read-only message.*

## My Contribution

During the course, this was a four-person team project; my areas were the interactive workout editor (drag-and-drop exercise/set editing with dnd-kit), the advanced SQL — exercise-suggestion query and stored-procedure integration — and the workout save flow. The portfolio pass is entirely mine: demo/live mode isolation, server-side read-only guards, environment validation, the credentials auth cleanup, unit and end-to-end tests, deployment hardening, and all documentation.

## What It Does

- Authenticates users with a credentials-based NextAuth flow (JWT sessions).
- Lists and filters exercises by keyword and target muscle.
- Lets users view exercise details and embedded demonstration videos.
- Builds workout templates with ordered exercises and per-set weight/rep tracking.
- Tracks workout completion duration and exercise history in live mode.
- Suggests exercises based on prior completion history, excluding disliked ones.

## Architecture

- `src/app`: Next.js App Router pages and API routes. Every mutation route checks demo mode server-side and returns a 403 read-only response before touching the database.
- `src/components`: Client and server UI components for navigation, search, workout editing, cards, and auth forms.
- `src/data`: The demo/live data boundary. Demo mode returns seeded fixtures; live mode calls MySQL through the lazy pool in `src/database/pool.ts`.
- `src/database`: MySQL schema (8 tables, normalized to BCNF), stored procedures, query references, and a CSV seed importer.
- `src/utils/auth.ts`: NextAuth configuration for demo credentials and live MySQL-backed credentials.

The database layer is intentionally raw SQL rather than an ORM: parameterized `mysql2` queries, two stored procedures (`UpdateInsertCompletedWorkout`, `UpdateInsertTemplateOnly`) that save a workout's template, contents, and sets atomically inside `REPEATABLE READ` transactions, and an exercise-suggestion query that filters by muscle group, completion count, and user preference.

## Quick Start

```bash
npm install
npm run demo
```

Open `http://localhost:3000`, then choose **Continue as Demo User**.

Demo mode is read-only. Create, update, delete, and save actions return clear read-only messages instead of writing to a database.

## Environment

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Core settings:

- `APP_MODE`: `demo` or `live`. Defaults to `demo`.
- `AUTH_SECRET`: required by NextAuth in both modes.
- `AUTH_TRUST_HOST`: set to `true` for hosted environments that require trusted proxy headers.
- `DATABASE_URL`: required only when `APP_MODE=live`.
- `YOUTUBE_API_KEY`: optional. If omitted, exercise pages use a static fallback video.

Do not commit real `.env` files or production credentials.

## Live MySQL Setup

The schema is in `src/database/schema.sql`, and workout save procedures are in `src/database/workoutPage.sql`.

For local live mode:

1. Start a local MySQL server.
2. Run `src/database/schema.sql`.
3. Run the procedure definitions in `src/database/workoutPage.sql`.
4. Create a least-privilege app user and set `DATABASE_URL`.
5. Optionally import seed CSVs.

```bash
mysql -u root < src/database/schema.sql
mysql -u root srsly_fit < src/database/workoutPage.sql

mysql -u root -e "CREATE USER IF NOT EXISTS 'srsly_app'@'127.0.0.1' IDENTIFIED BY 'local-password'; GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON srsly_fit.* TO 'srsly_app'@'127.0.0.1'; FLUSH PRIVILEGES;"

python3 -m venv .venv
.venv/bin/python -m pip install mysql-connector-python

.venv/bin/python src/database/import_data.py --data-dir /path/to/csv-directory --truncate
```

Run seed imports with the local root MySQL account. The `--truncate` path resets auto-increment values and needs table `ALTER` privileges; the running web app should still use the restricted `srsly_app` account.

The importer expects these CSV files (the original exercise catalog was seeded from the public megaGym exercise dataset, which is not redistributed in this repo):

- `Users.csv`
- `Muscles.csv`
- `Exercises.csv`
- `ExercisesMuscles.csv`
- `ExerciseLog.csv`
- `Sets.csv`
- `WorkoutTemplates.csv`
- `WorkoutContents.csv`

## Deployment Safeguards

Use `APP_MODE=demo` for public portfolio deployments unless the live database and API keys are intentionally provisioned.

The public demo deploys to Vercel in read-only demo mode:

- `APP_MODE=demo`
- `AUTH_SECRET=<generated secret>`
- `AUTH_TRUST_HOST=true`
- `DATABASE_URL=`
- `YOUTUBE_API_KEY=`

This demo deployment does not require MySQL, does not call the YouTube API, and blocks write actions with read-only messages.

For future live deployments:

- Restrict `YOUTUBE_API_KEY` by HTTP referrer or hosting origin.
- Set YouTube API quota alerts and low daily limits.
- Use a least-privilege MySQL user for the deployed app.
- Store credentials in the hosting provider's secret manager.
- Keep write access private until password hashing, rate limiting, and abuse controls are added.

## Testing

Unit tests (Vitest) cover the demo-data fixtures, data transformations, and the read-only response contract. End-to-end tests (Playwright) boot the app in demo mode and verify the demo login, fixture-backed exercise search, and that workout saves and creation are blocked read-only. CI runs all of this plus lint, typecheck, and the demo build on every push.

```bash
npm run lint
npm run typecheck
npm run test
npm run demo:build
npm run test:e2e
npm audit --audit-level=moderate
```

For a live-mode compile check without connecting to MySQL during build:

```bash
APP_MODE=live AUTH_SECRET=local-build-secret DATABASE_URL=mysql://user:password@127.0.0.1:3306/srsly_fit YOUTUBE_API_KEY= npm run build
```

## Design Notes & Limitations

- **Live-mode auth stores and compares plaintext passwords.** Inherited from the course project and deliberately left unfixed rather than half-fixed: the public deployment never exercises this path (demo mode has no database), and the README gates any live deployment on adding password hashing, rate limiting, and abuse controls first.
- **Raw SQL over an ORM was a course requirement that became a design choice.** All queries are parameterized through `mysql2`, and multi-table workout saves go through stored procedures inside `REPEATABLE READ` transactions, which keeps the save path atomic without an ORM dependency.
- **Demo mode is enforced server-side, not just hidden in the UI.** Every mutation API route checks the mode and returns 403 before any data access, so the public demo cannot be mutated even with direct API calls.
- **Sessions are JWTs, not database sessions.** Chosen so demo mode works with zero infrastructure; the trade-off is no server-side session revocation.
- **Query performance figures from the course (optimizer costs in the docs/ PDFs) are MySQL `EXPLAIN` cost estimates**, not measured latencies, and came from a small course dataset.
- **The exercise catalog is not bundled.** The seed importer expects CSVs locally; the original Kaggle-sourced dataset is not redistributed here.

## Project Documentation

The `docs/` directory includes the original database design artifacts: the ER diagram and assumptions, the relational design, and the BCNF normalization analysis.

For local server, MySQL, and seed-data commands, see [`docs/local-development-cheatsheet.md`](docs/local-development-cheatsheet.md).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, dnd-kit
- **Auth**: NextAuth 5 (credentials provider, JWT sessions)
- **Database**: MySQL via `mysql2` (raw parameterized SQL + stored procedures)
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (read-only demo mode)

## License

MIT — see [LICENSE](LICENSE).
