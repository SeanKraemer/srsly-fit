import { createConnection, RowDataPacket } from 'mysql2/promise';
import { notFound } from 'next/navigation';
import { EditExerciseForm } from './EditExerciseForm';
import { ExerciseDataForEditForm, MuscleData } from '../../actions';
import { env } from '@/src/env';
import type { Metadata } from 'next';
import { auth } from '@/src/utils/auth'; // 1. Import auth
import { redirect } from 'next/navigation'; // 2. Import redirect

type EditExercisePageProps = {
  // This is the fix. By intersecting the params with a promise-like shape,
  // we can satisfy Next.js's internal type checker, which incorrectly
  // expects a Promise for `params` in async components. At runtime, `params`
  // is still a plain object, so your code works as expected.
  params: { id: string } & Promise<{}>;
};

// This function helps Next.js correctly infer the types for the page props,
// which can resolve stubborn build errors. It also sets the page title.
export async function generateMetadata({ params }: EditExercisePageProps): Promise<Metadata> {
  const id = Number(params.id);
  const conn = await createConnection(env.DATABASE_URL);
  const [rows] = await conn.execute<RowDataPacket[]>(
    'SELECT name FROM Exercises WHERE exerciseId = ?',
    [id]
  );
  await conn.end();

  const exerciseName = rows[0]?.name ?? 'Exercise';

  return {
    title: `Edit ${exerciseName}`,
  };
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  const exerciseId = Number(params.id);
  // 3. Get user from session
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id; // 4. Use dynamic ID

  const conn = await createConnection(env.DATABASE_URL);

  const [exerciseRows] = await conn.execute<ExerciseDataForEditForm[]>(
    `SELECT e.exerciseId, e.name, e.description, e.ownerId, (SELECT JSON_ARRAYAGG(em.muscleId) FROM ExercisesMuscles em WHERE em.exerciseId = e.exerciseId) as muscleIds FROM Exercises e WHERE e.exerciseId = ? AND e.ownerId = ?`,
    [exerciseId, userId]
  );

  if (exerciseRows.length === 0) notFound();
  const exercise = exerciseRows[0];
  if (!exercise.muscleIds) exercise.muscleIds = [];

  const [allMuscles] = await conn.execute<MuscleData[]>('SELECT muscleId, name FROM Muscles ORDER BY name ASC');
  await conn.end();

  return <EditExerciseForm exercise={exercise} allMuscles={allMuscles} />;
}
