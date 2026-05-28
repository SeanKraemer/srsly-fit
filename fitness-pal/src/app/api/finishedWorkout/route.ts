// src/app/api/finishedWorkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import { env } from '@/src/env';
import { auth } from '@/src/utils/auth'; // 1. Import auth

export async function POST(req: NextRequest) {
    try {
        // 2. Get user from session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id; // 3. Use the dynamic ID

        const body = await req.json();
        const { workoutId, workoutData, exercises } = body;

        console.log(
          `Ending workout ${workoutId} for user ${userId} with duration ${workoutData.lastDuration}s`
        );

        const conn = await createConnection(env.DATABASE_URL);

        await conn.execute(
          'CALL UpdateInsertCompletedWorkout(?, ?, ?, ?)',
          [
            parseInt(workoutId),
            userId, // 4. Pass the dynamic ID to the stored procedure
            JSON.stringify(workoutData),
            JSON.stringify(exercises),
          ]
        );
        await conn.end();

        return NextResponse.json({ redirect: '/dashboard' });
    } catch (error: any) {
        console.error('Error in /api/completedWorkout:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}