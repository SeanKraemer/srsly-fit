// src/app/api/onlySavedWorkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import { env } from '@/src/env';
import { auth } from '@/src/utils/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { workoutId, workoutData, exercises } = body;

        const conn = await createConnection(env.DATABASE_URL);

        // --- THE FIX: Call the correct stored procedure ---
        await conn.execute(
          'CALL UpdateInsertTemplateOnly(?, ?, ?, ?)', // Use the "Template Only" procedure
          [
            parseInt(workoutId),
            userId,
            JSON.stringify(workoutData),
            JSON.stringify(exercises),
          ]
        );
        await conn.end();

        return NextResponse.json({ message: 'Workout Template has been saved' }, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/onlySavedWorkout:', error); // Corrected log message
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}