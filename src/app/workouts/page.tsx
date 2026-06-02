export const dynamic = 'force-dynamic'; // Needed to make the cards reload if the back button is pressed after a card is deleted

import DeleteCard from '@/src/components/deleteCard'
import CreateWorkoutButton from '@/src/components/CreateWorkoutButton'
import WorkoutSearch from '@/src/components/WorkoutSearch';
import { auth } from '@/src/utils/auth';
import { redirect } from 'next/navigation';
import { getWorkoutTemplates } from '@/src/data/fitnessData';

interface WorkoutsPageProps {
    // This type definition is based on a similar fix in exercises/page.tsx
    searchParams: Promise<{ [key:string]: string | string[] | undefined }>;
}

function getTimeSince(dateMaybe: Date | string): string {
    const date = new Date(dateMaybe + 'Z');
    const now = new Date();
    const secondsSince = (now.getTime() - date.getTime()) / 1000;
    
    // seconds is the amount of 1 full unit of specified time in seconds
    const timeVars = [
        {unit: "year",   seconds: 60 * 60 * 24 * 365},
        {unit: "week",   seconds: 60 * 60 * 24 * 7},
        {unit: "day",    seconds: 60 * 60 * 24},
        {unit: "hour",   seconds: 60 * 60},
        {unit: "minute", seconds: 60},
        {unit: "second", seconds: 1},
    ]

    // Return the time since in the greatest unit of time
    for (const currVar of timeVars) {
        const amount = Math.floor(secondsSince / currVar.seconds);
        if (amount > 0) {
            let timeStr = currVar.unit;
            if (amount > 1) timeStr = `${timeStr}s`;
            return `About ${amount} ${timeStr} ago`;
        }
    }
    return "Now"
}

// Shows all workouts
export default async function Workouts({ searchParams }: WorkoutsPageProps) {
    const resolvedSearchParams = await searchParams;

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
    }
    const userId = session.user.id;
    const searchTerm = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
    const workoutTemplates = await getWorkoutTemplates(userId, searchTerm);
    
    return (
        <main className='w-full h-fit flex-wrap bg-blue-700 rounded'>
            <div className="flex justify-center items-center p-4">
                <h1 className='font-bold text-xl'>WORKOUTS</h1>
            </div>
            <div className="text-center my-4">
                <CreateWorkoutButton/>
            </div>
            <div className="mx-auto mb-5 px-5 max-w-md">
                <WorkoutSearch initialSearchTerm={searchTerm} />
            </div>
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-blue-500'>
                {workoutTemplates.map((workoutTemplates) => {
                    return (
                        <DeleteCard
                            href={`/workouts/${workoutTemplates.workoutId}`}
                            key={workoutTemplates.workoutId}
                            workoutId={workoutTemplates.workoutId}
                            userId={Number(userId)} 
                            deleteRoute="/api/deleteWorkout"
                        >
                            <div className="font-bold">{workoutTemplates.name}</div>
                            <div className="text-sm text-gray-100">{getTimeSince(workoutTemplates.lastDate)}</div>
                        </DeleteCard>
                    )
                })}
            </section>
            {workoutTemplates.length === 0 && searchTerm && (
                <p className='text-center text-white pb-5'>No workouts found matching your search.</p>
            )}
        </main>
    )
}
