import { createConnection, RowDataPacket } from "mysql2/promise"
import { env } from "@/src/env"
import { Suspense } from 'react'
import VideoComponent from './video_component'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/src/utils/auth'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>;
}

interface ExerciseDetails extends RowDataPacket {
    exerciseId: number;
    name: string;
    description: string;
    ownerId: number | null;
    muscles: string[] | null; // JSON_ARRAYAGG can return NULL
}

// Show a single exercise
export default async function Exercise({ params }: Props) {
    // THE FIX: Destructure the 'id' right at the top.
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    // Now we can safely use the userId from the session.
    const currentUserId = session.user.id;

    const conn = await createConnection(env.DATABASE_URL);
    // Using LEFT JOIN ensures exercises are returned even if they have no muscles.
    const [rows] = await conn.execute<ExerciseDetails[]>(
        `SELECT exers.exerciseId, exers.name, exers.description, exers.ownerId, JSON_ARRAYAGG(musc.name) AS muscles
         FROM Exercises exers
         LEFT JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
         LEFT JOIN Muscles musc ON ems.muscleId = musc.muscleId
         WHERE exers.exerciseId = ? AND (exers.ownerId = ? OR exers.ownerId IS NULL)
         GROUP BY exers.exerciseId, exers.name, exers.description, exers.ownerId`,
        [Number(id), currentUserId]
    )
    await conn.end();

    if (rows.length === 0) {
        notFound();
    }

    const exercise = rows[0];
    const isOwner = exercise.ownerId === Number(currentUserId);

    const name = exercise.name;
    const desc = exercise.description;
    // Safely handle the case where an exercise has no muscles.
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