# Srsly Fit

Srsly Fit is a workout planning web app built with Next.js, MySQL, and NextAuth. The app lets users manage exercises, build workout templates, track completed sets, and view exercise demonstration videos.

This repository is a private portfolio copy prepared from a team database systems project. It has been sanitized for eventual public release: live credentials were removed, local environment files are ignored, and course submission instructions were replaced with project-focused setup notes.

## What It Does

- Authenticates users with a credentials-based login flow.
- Stores exercises, muscles, workout templates, workout contents, exercise logs, and set history in MySQL.
- Suggests exercises for a workout using a query over prior completion history.
- Embeds a relevant exercise demonstration video through the YouTube Data API when configured.
- Falls back to a static demonstration video when no YouTube API key is available.

## Tech Stack

- Next.js 15 and React 19
- TypeScript
- MySQL through `mysql2`
- NextAuth beta
- Tailwind CSS
- Firebase App Hosting configuration for deployment

## Local Setup

```bash
cd fitness-pal
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Environment

Create `fitness-pal/.env.local` from `fitness-pal/.env.example`.

Required for a fully working local app:

- `AUTH_SECRET`: secret used by NextAuth.
- `DATABASE_URL`: MySQL connection string.

Optional:

- `YOUTUBE_API_KEY`: YouTube Data API key. If omitted, exercise pages use a static fallback video.
- `AUTH_TRUST_HOST`: set to `true` for hosted environments that need it.

Do not commit real `.env` files or production credentials.

## Database Setup

The schema is in `fitness-pal/src/database/schema.sql`.

For local development:

1. Create a MySQL database.
2. Run the schema SQL.
3. Put the connection string in `DATABASE_URL`.
4. Optionally import seed CSVs with:

```bash
cd fitness-pal
python src/database/import_data.py --data-dir /path/to/csv-directory
```

The importer expects these CSV files in the data directory:

- `Users.csv`
- `Muscles.csv`
- `Exercises.csv`
- `ExercisesMuscles.csv`
- `ExerciseLog.csv`
- `Sets.csv`
- `WorkoutTemplates.csv`
- `WorkoutContents.csv`

## Verification

```bash
cd fitness-pal
npm run build
```

The `lint` script currently points at the legacy `next lint` command, which is no longer available in newer Next.js releases. Updating lint tooling is a follow-up polish task.

## Portfolio Notes

This first pass intentionally avoids broad product renaming from the original internal `fitness-pal` app folder. Future polish should rename visible package/app references to `srsly-fit`, add seed data that can be shared publicly, and replace the credentials auth prototype with a production-grade password hashing flow.
