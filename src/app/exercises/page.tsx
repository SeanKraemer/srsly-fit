import GenericCard from '@/src/components/genericCard';
import DeleteCard from '@/src/components/deleteCard';
import Link from "next/link";
import ExerciseSearch from '@/src/components/ExerciseSearch';
import { auth } from '@/src/utils/auth';
import { redirect } from "next/navigation";
import { getExercises, getMuscles } from "@/src/data/fitnessData";

interface ExercisesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Exercises({ searchParams }: ExercisesPageProps) {
    const resolvedSearchParams = await searchParams;
    const keywords = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
    const muscleIds = typeof resolvedSearchParams.muscle === 'string' ? resolvedSearchParams.muscle : '';

    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/exercises");
    }
    const ownerId = session.user.id;

    const muscles = await getMuscles();
    const exercises = await getExercises(ownerId, keywords, muscleIds);

    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <div className="flex justify-center items-center p-4">
                <h1 className='font-bold text-xl'>EXERCISES</h1>
            </div>

            <div className="text-center my-4">
                <Link href="/exercises/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors inline-block">
                    Create New Exercise
                </Link>
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 pb-4">
                <ExerciseSearch
                    initialSearchTerm={keywords}
                    initialSelectedMuscle={muscleIds}
                    muscles={muscles}
                />
            </div>
            
            { (keywords || muscleIds) && (
                <p className='text-center text-white mb-2'>
                    Found {exercises.length} results.
                </p>
            )}
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {exercises?.map((exercise) => {
                    const displayableMuscles = exercise.muscles?.filter(muscle => muscle !== "name\r") || [];
                    const cardContent = (
                        <div className="flex flex-col">
                            <span className="font-bold">{exercise.name}</span>
                            {displayableMuscles.length > 0 && (
                                <span className="text-sm italic text-gray-200">
                                    {displayableMuscles.join(', ')}
                                </span>
                            )}
                        </div>
                    );

                    if (exercise.ownerId === Number(ownerId)) {
                        return (
                            <DeleteCard
                                href={`/exercises/${exercise.exerciseId}`}
                                key={exercise.exerciseId}
                                exerciseId={Number(exercise.exerciseId)}
                                userId={Number(ownerId)}
                                deleteRoute="/api/exercises/delete"
                                buttonBgClass="bg-emerald-700"
                                title="Delete exercise"
                            >
                                {cardContent}
                            </DeleteCard>
                        );
                    }

                    return (
                        <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                            {cardContent}
                        </GenericCard>
                    )
                })}
            </section>
            {exercises.length === 0 && (keywords || muscleIds) && (
                <p className='text-center text-white'>No exercises found matching your filters.</p>
            )}
        </main>
    );
}
