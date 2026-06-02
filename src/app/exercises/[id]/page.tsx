import { Suspense } from 'react'
import VideoComponent from './video_component'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/src/utils/auth'
import { notFound } from 'next/navigation'
import { getExerciseDetail } from '@/src/data/fitnessData'

interface Props {
    params: Promise<{ id: string }>;
}

// Show a single exercise
export default async function Exercise({ params }: Props) {
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    const currentUserId = session.user.id;

    const exercise = await getExerciseDetail(Number(id), currentUserId);
    if (!exercise) {
        notFound();
    }

    const isOwner = exercise.ownerId === Number(currentUserId);

    const name = exercise.name;
    const desc = exercise.description;
    const muscles: string[] = exercise.muscles?.filter(Boolean) ?? [];

    const showMuscles = muscles.length > 0;

    return (
        <main className='w-full h-full flex-wrap bg-emerald-700 rounded'>
            <div className="flex justify-between items-center p-4 gap-4">
                <div className="flex-1"></div> {/* Left Spacer */}
                <h1 className='font-bold text-center text-2xl flex-grow'>{name}</h1>
                <div className="flex-1 text-right">
                    {isOwner && (
                        <Link href={`/exercises/${id}/edit`} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded whitespace-nowrap">
                            Edit Exercise
                        </Link>
                    )}
                </div>
            </div>
            <p className='font-semibold w-full text-center'>{desc}</p>
            
            {showMuscles && (
                <div className='w-full text-center mt-4'>
                    <h2 className='font-bold'>Targeted Muscles:</h2>
                    <p className='font-semibold'>{muscles.join(', ')}</p>
                </div>
            )}

            <Suspense fallback={<p>Loading video...</p>}>
                <VideoComponent exerciseName={name} />
            </Suspense>
        </main>
    )
}
