// src/app/api/workouts/suggest-exercise/route.ts

import { NextResponse } from 'next/server';
import { pool } from '@/src/database/pool';
import { auth } from '@/src/utils/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const { workoutId } = await request.json();

        if (!workoutId) {
            return NextResponse.json({ message: 'Workout ID is required' }, { status: 400 });
        }

        const query = `
            SELECT
                exers.exerciseId,
                exers.name,
                -- 1. Create an alias 'completed_count' for the calculated column
                COALESCE(eLog.timesCompleted, 0) AS completed_count
            FROM
                Exercises AS exers
            LEFT JOIN 
                ExerciseLog AS eLog ON exers.exerciseId = eLog.exerciseId AND eLog.userId = ?
            WHERE
                (exers.ownerId IS NULL OR exers.ownerId = ?)
                AND exers.exerciseId NOT IN (
                    SELECT exerciseId
                    FROM WorkoutContents
                    WHERE userId = ? AND workoutId = ?
                )
            -- 2. Group by the alias
            GROUP BY
                exers.exerciseId, exers.name, completed_count
            -- 3. Use the alias in the HAVING clause
            HAVING
                completed_count <= COALESCE((
                    SELECT AVG(timesCompleted)
                    FROM ExerciseLog
                    WHERE userId = ?
                ), 0)
            ORDER BY
                RAND()
            LIMIT 1;
        `;

        const [rows]: any = await pool.query(query, [userId, userId, userId, workoutId, userId]);

        if (rows.length === 0) {
            return NextResponse.json(
                { message: 'No suitable exercise suggestions found. Try adding more exercises or completing some!' },
                { status: 404 }
            );
        }

        const suggestedExercise = rows[0];

        return NextResponse.json({ suggestedExercise }, { status: 200 });

    } catch (error) {
        console.error('Failed to suggest an exercise:', error);
        return NextResponse.json(
            { message: 'An error occurred while suggesting an exercise.' },
            { status: 500 }
        );
    }
}