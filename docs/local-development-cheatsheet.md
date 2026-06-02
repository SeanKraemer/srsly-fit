# Local Development Cheatsheet

This guide covers the day-to-day commands for running Srsly Fit locally, checking MySQL data, editing seed records, and managing the Next.js dev server.

## Example Local Settings

Example local live-mode database URL. Replace `local-password` with the password you created for `srsly_app`:

```env
DATABASE_URL=mysql://srsly_app:local-password@127.0.0.1:3306/srsly_fit
```

Seed login after a raw CSV import:

```text
username: user1
password: password
```

Do not use real personal passwords in this app yet. The local seed data uses simple plaintext credentials because this portfolio cleanup has not added production password hashing.

## App Modes

Demo mode runs without MySQL writes:

```bash
npm run demo
```

Live mode uses local MySQL:

```bash
APP_MODE=live \
AUTH_SECRET=local-dev-secret \
AUTH_TRUST_HOST=true \
DATABASE_URL=mysql://srsly_app:local-password@127.0.0.1:3306/srsly_fit \
YOUTUBE_API_KEY= \
npm run dev
```

If `.env.local` already has those values, this is enough:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

## Check Whether The App Server Is Running

Check port `3000`:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

If something is listening, the output includes a `PID`. Example:

```text
COMMAND   PID        USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
node    36418 seankraemer   17u  IPv4   ...    0t0      TCP 127.0.0.1:3000 (LISTEN)
```

Stop the server by PID:

```bash
kill 36418
```

If it does not stop:

```bash
kill -9 36418
```

Start the server again:

```bash
npm run dev
```

Use a different port if `3000` is busy:

```bash
npm run dev -- --port 3001
```

## Check Whether MySQL Is Running

Check the Homebrew service:

```bash
brew services list | grep -E '^Name|^mysql'
```

Optional: install `ripgrep` if you want to use `rg` locally:

```bash
brew install ripgrep
```

Start, stop, or restart MySQL:

```bash
brew services start mysql
brew services stop mysql
brew services restart mysql
```

Check whether MySQL is listening on port `3306`:

```bash
lsof -nP -iTCP:3306 -sTCP:LISTEN
```

Ping MySQL:

```bash
mysqladmin ping -h 127.0.0.1 -P 3306 -u root
```

## Open A MySQL Prompt

As the app user:

```bash
MYSQL_PWD=local-password mysql -u srsly_app -h 127.0.0.1 -D srsly_fit
```

As root:

```bash
mysql -u root
```

Exit MySQL:

```sql
EXIT;
```

## View Tables And Rows

Common page-to-table map:

| App area | Main tables used |
| --- | --- |
| Login | `Users` |
| Dashboard | `WorkoutTemplates`, `ExerciseLog` |
| Exercises list/detail | `Exercises`, `ExercisesMuscles`, `Muscles` |
| Workouts list | `WorkoutTemplates` |
| Workout detail/edit | `WorkoutTemplates`, `WorkoutContents`, `Exercises`, `ExerciseLog`, `Sets` |

Show tables:

```sql
SHOW TABLES;
```

Describe a table:

```sql
DESCRIBE Users;
DESCRIBE WorkoutTemplates;
DESCRIBE Exercises;
```

Count rows:

```sql
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Exercises;
SELECT COUNT(*) FROM WorkoutTemplates;
SELECT COUNT(*) FROM `Sets`;
```

The dashboard's **Exercise Completion History** number is `SUM(ExerciseLog.timesCompleted)` for the signed-in user. That number can be larger than the exercise catalog size because it tracks repeated completions over time.

```sql
SELECT SUM(timesCompleted) AS total_exercise_completions
FROM ExerciseLog
WHERE userId = 1;
```

Preview rows:

```sql
SELECT * FROM Users LIMIT 10;
SELECT workoutId, userId, name, lastDate, lastDuration FROM WorkoutTemplates LIMIT 10;
SELECT exerciseId, ownerId, name FROM Exercises LIMIT 10;
```

Find one user's workouts:

```sql
SELECT workoutId, userId, name, lastDate, lastDuration
FROM WorkoutTemplates
WHERE userId = 1
ORDER BY workoutId;
```

Find exercises in one workout:

```sql
SELECT wc.workoutId, wc.userId, wc.`order`, e.exerciseId, e.name
FROM WorkoutContents wc
JOIN Exercises e ON e.exerciseId = wc.exerciseId
WHERE wc.userId = 1 AND wc.workoutId = 1
ORDER BY wc.`order`;
```

Find sets for one exercise:

```sql
SELECT setId, userId, exerciseId, `order`, lbs, reps
FROM `Sets`
WHERE userId = 1 AND exerciseId = 16
ORDER BY `order`;
```

## Rename The Seed User

To change `user1` to `Sean` while keeping the same local password after importing the CSVs:

```sql
UPDATE Users
SET username = 'Sean',
    firstName = 'Sean',
    lastName = 'Kraemer'
WHERE userId = 1;
```

This is a local personalization step. The source CSVs stay unchanged, so running the reset/import flow restores `user1` until this update is applied again.

Then log into the app with:

```text
username: Sean
password: password
```

To check the update:

```sql
SELECT userId, username, firstName, lastName
FROM Users
WHERE userId = 1;
```

## Insert Examples

Create a new local test user:

```sql
INSERT INTO Users (username, password, firstName, lastName)
VALUES ('local_test', 'password', 'Local', 'Tester');
```

Create a custom exercise for user `1`:

```sql
INSERT INTO Exercises (ownerId, name, description, video)
VALUES (1, 'Portfolio Test Exercise', 'Local-only exercise for testing.', NULL);
```

Create a workout template for user `1`:

```sql
INSERT INTO WorkoutTemplates (userId, lastDate, name, lastDuration)
VALUES (1, NULL, 'Portfolio Test Workout', NULL);
```

Add an exercise to a workout:

```sql
INSERT INTO WorkoutContents (workoutId, userId, exerciseId, `order`)
VALUES (1, 1, 16, 0);
```

Use the app UI for most write testing when possible, because the UI also exercises the API routes and stored procedures.

## App Pages For Manual Testing

After logging in:

```text
/dashboard
/exercises
/exercises/create
/exercises/1
/exercises/1/edit
/workouts
/workouts/1
```

Useful flows:

- Create an exercise at `/exercises/create`.
- Edit a custom exercise from its detail page.
- Create a workout from `/workouts`.
- Open a workout detail page and save or finish the workout.
- Confirm the changes in MySQL with the `SELECT` queries above.

## Reset And Reimport Seed Data

This resets the schema and reloads source CSVs:

```bash
mysql -u root < src/database/schema.sql
mysql -u root srsly_fit < src/database/workoutPage.sql

.venv/bin/python src/database/import_data.py \
  --data-dir /path/to/csv-directory \
  --truncate
```

Run reset imports with the local root MySQL account. The `--truncate` path resets auto-increment values and needs table `ALTER` privileges; the running web app should still use the restricted `srsly_app` account.

Apply the local Sean login after reset:

```bash
mysql -u root srsly_fit -e "UPDATE Users SET username='Sean', firstName='Sean', lastName='Kraemer' WHERE userId=1;"
```

Verify row counts:

```bash
MYSQL_PWD=local-password mysql -u srsly_app -h 127.0.0.1 -D srsly_fit -e "SELECT 'Users' AS table_name, COUNT(*) AS rows_count FROM Users UNION ALL SELECT 'Muscles', COUNT(*) FROM Muscles UNION ALL SELECT 'Exercises', COUNT(*) FROM Exercises UNION ALL SELECT 'ExercisesMuscles', COUNT(*) FROM ExercisesMuscles UNION ALL SELECT 'ExerciseLog', COUNT(*) FROM ExerciseLog UNION ALL SELECT 'Sets', COUNT(*) FROM \`Sets\` UNION ALL SELECT 'WorkoutTemplates', COUNT(*) FROM WorkoutTemplates UNION ALL SELECT 'WorkoutContents', COUNT(*) FROM WorkoutContents;"
```

Expected imported row counts from the current CSV set:

| Table | Rows |
| --- | ---: |
| `Users` | 2 |
| `Muscles` | 17 |
| `Exercises` | 2920 |
| `ExercisesMuscles` | 2918 |
| `ExerciseLog` | 5838 |
| `Sets` | 5863 |
| `WorkoutTemplates` | 16 |
| `WorkoutContents` | 86 |

## LAN Testing

To open the local dev server from another device on the same network, allow that origin explicitly:

```bash
NEXT_ALLOWED_DEV_ORIGINS=10.0.0.12 \
npm run dev -- --hostname 0.0.0.0
```

Use your current local network IP in place of `10.0.0.12`.

## Manual Portfolio QA

Local live-mode walkthrough:

1. Log in as `Sean` / `password` after applying the personalization step, or `user1` / `password` after a raw CSV reset.
2. Open `/dashboard` and confirm workout cards and Exercise Completion History load.
3. Open `/workouts`, click a workout card, and confirm sets render on the workout detail page.
4. Create an empty workout, save it, finish it, and confirm the database changed.
5. Open `/exercises`, search by keyword, open an exercise detail page, and create/edit/delete a custom exercise.

Public demo walkthrough:

1. Open the deployed URL.
2. Click **Continue as Demo User**.
3. Confirm `/dashboard`, `/workouts`, `/workouts/1`, `/exercises`, and `/exercises/1` load.
4. Try a write action and confirm it shows a read-only demo message.

## Build And Type Checks

Demo build:

```bash
npm run demo:build
```

Type check:

```bash
npm run typecheck
```

Unit and browser smoke tests:

```bash
npm run test
npm run test:e2e
```

Live-mode build with local MySQL settings:

```bash
APP_MODE=live \
AUTH_SECRET=local-build-secret \
AUTH_TRUST_HOST=true \
DATABASE_URL=mysql://srsly_app:local-password@127.0.0.1:3306/srsly_fit \
YOUTUBE_API_KEY= \
npm run build
```
