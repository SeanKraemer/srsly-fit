# Srsly Fit

Srsly Fit is a full-stack workout planning and tracking app built with Next.js, React, NextAuth, and MySQL. It supports exercise search, workout templates, set tracking, completion history, and exercise demonstration videos.

This portfolio version is prepared for public review with a safe read-only demo mode. Demo mode uses seeded fixtures, a demo login, and a static video fallback, so it can run without live database credentials or YouTube API quota.

Live demo: [https://srsly-fit.vercel.app](https://srsly-fit.vercel.app)

## My Contribution

I owned the public-ready full-stack pass for this app: Next.js routing and UI cleanup, credentials auth integration, MySQL query and stored-procedure integration, workout/exercise flows, demo-mode isolation, environment documentation, and deployment-safety notes.

## What It Does

- Authenticates users with a credentials-based NextAuth flow.
- Lists and filters exercises by keyword and target muscle.
- Lets users view exercise details and embedded demonstration videos.
- Builds workout templates with ordered exercises and sets.
- Tracks workout completion duration and exercise history in live mode.
- Suggests exercises based on prior completion history in live mode or seeded fixtures in demo mode.

## Architecture

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Client and server UI components for navigation, search, workout editing, cards, and auth forms.
- `src/data`: Demo/live data boundary. Demo mode returns fixtures; live mode calls MySQL through the lazy pool in `src/database/pool.ts`.
- `src/database`: MySQL schema, import helper, and query/procedure setup references.
- `src/utils/auth.ts`: NextAuth configuration for demo credentials and live MySQL-backed credentials.

## Project Documentation

The `docs/` directory includes the database design artifacts and an archived Summer 2025 project document for additional context on the original product scope and data model.

For local server, MySQL, and seed-data commands, see [`docs/local-development-cheatsheet.md`](docs/local-development-cheatsheet.md).

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

The importer expects these CSV files:

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

For the first public portfolio link, deploy to Vercel in read-only demo mode:

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

## Verification

```bash
npm run lint
npm run demo:build
npm run typecheck
npm run test
npm run test:e2e
npm audit --audit-level=moderate
```

For a live-mode compile check without connecting to MySQL during build:

```bash
APP_MODE=live AUTH_SECRET=local-build-secret DATABASE_URL=mysql://user:password@127.0.0.1:3306/srsly_fit YOUTUBE_API_KEY= npm run build
```
