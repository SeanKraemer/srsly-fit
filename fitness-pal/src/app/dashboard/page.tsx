import { env } from "@/src/env";
import { createConnection, RowDataPacket } from "mysql2/promise";
import GenericCard from '@/src/components/genericCard'
import { auth } from "@/src/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Force the page to be dynamically rendered on every request.
export const dynamic = 'force-dynamic';

// DB data used for the cards
interface WorkoutTemplateData extends RowDataPacket {
    workoutId: number;
    userId: number;
    lastDate: Date;
    name: string;
    lastDuration: number;
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
            var timeStr = ""
            if (amount === 1) {
                timeStr = currVar.unit;
            } else {
                timeStr = `${currVar.unit}s`;
            }
            return `About ${amount} ${timeStr} ago`;
        }
    }
    return "Now"
}

function formatDuration(totalSeconds: number | null): string {
    if (totalSeconds === null || totalSeconds <= 0) {
        return "N/A";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(' ') : '0s';
}

export default async function DashBoard() {
    const session = await auth();

    // Protect the route. If no session or user ID, redirect to sign-in.
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    // Now we can safely use the userId from the session.
    const userId = session.user.id;
    const conn = await createConnection(env.DATABASE_URL);

    // Query for the 3 most recent workouts
    const [workoutTemplates, __] = await conn.execute<WorkoutTemplateData[]>(
        'SELECT workoutId, lastDate, name, lastDuration FROM WorkoutTemplates WHERE userId = ? ORDER BY lastDate DESC LIMIT 3',
        [userId]
    );

    // Query for total exercises completed
    const [totalExercisesRows] = await conn.execute<RowDataPacket[]>(
        'SELECT SUM(timesCompleted) as total FROM ExerciseLog WHERE userId = ?',
        [userId]
    );
    const totalExercisesCompleted = totalExercisesRows[0].total || 0;

    await conn.end();

    return (
        <main className='w-full h-fit flex-wrap bg-orange-700 rounded'>
            <h1 className='font-bold w-full text-center text-2xl pt-4'>Hello, {session.user.name?.split(' ')[0] || 'User'}!</h1>
            {workoutTemplates.length > 0 ? (
                <>
                    <h2 className='font-bold w-full text-center text-xl py-2'>Ready to jump back in?</h2>
                    <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-orange-500'>
                        {workoutTemplates.map((workoutTemplate) => (
                            <GenericCard href={`/workouts/${workoutTemplate.workoutId}`} key={workoutTemplate.workoutId}>
                                <div className="font-bold">{workoutTemplate.name}</div>
                                <div className="text-sm text-gray-100">{getTimeSince(workoutTemplate.lastDate)}</div>
                                <div className="text-sm text-gray-200 mt-2">
                                    <span className="font-semibold">Last session:</span> {formatDuration(workoutTemplate.lastDuration)}
                                </div>
                            </GenericCard>
                        ))}
                    </section>
                </>
            ) : (
                <div className="text-center text-white p-5 mb-5">
                    <p>Oops, looks like you haven't done any workouts yet. Go to the <Link href="/workouts" className="font-bold underline hover:text-orange-200">workouts page</Link> to get started!</p>
                </div>
            )}
            <div className="text-center pb-4 text-white">
                <h3 className="font-bold text-xl">Total Exercises Completed</h3>
                <p className="text-4xl font-bold">{totalExercisesCompleted}</p>
            </div>
        </main>
    )
}