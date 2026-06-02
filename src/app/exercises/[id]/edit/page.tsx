import { notFound } from 'next/navigation';
import { EditExerciseForm } from './EditExerciseForm';
import type { Metadata } from 'next';
import { auth } from '@/src/utils/auth';
import { redirect } from 'next/navigation';
import { getExerciseDetail, getExerciseForEdit } from '@/src/data/fitnessData';

type EditExercisePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditExercisePageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = await getExerciseDetail(Number(id), '1');
  const exerciseName = exercise?.name ?? 'Exercise';

  return {
    title: `Edit ${exerciseName}`,
  };
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
  const { id } = await params;
  const exerciseId = Number(id);
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const { exercise, allMuscles } = await getExerciseForEdit(exerciseId, userId);
  if (!exercise) notFound();

  return <EditExerciseForm exercise={exercise} allMuscles={allMuscles} />;
}
