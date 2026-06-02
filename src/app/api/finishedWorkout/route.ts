import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import { env, isDemoMode } from '@/src/env';
import { auth } from '@/src/utils/auth';
import { demoReadOnlyResponse } from '@/src/app/api/demoMode';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        if (isDemoMode) {
            return demoReadOnlyResponse('save workouts');
        }

        const body = await req.json();
        const { workoutId, workoutData, exercises } = body;

        const conn = await createConnection(env.DATABASE_URL!);

        await conn.execute(
          'CALL UpdateInsertCompletedWorkout(?, ?, ?, ?)',
          [
            parseInt(workoutId),
            userId,
            JSON.stringify(workoutData),
            JSON.stringify(exercises),
          ]
        );
        await conn.end();

        return NextResponse.json({ redirect: '/dashboard' });
    } catch (error: unknown) {
        console.error('Error in /api/finishedWorkout:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
