// src/app/api/createEmptyWorkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import { env } from '@/src/env';
import { ResultSetHeader } from 'mysql2/promise';
import { auth } from '@/src/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const now = new Date();
    const conn = await createConnection(env.DATABASE_URL);

    const [insertResults] = await conn.execute<ResultSetHeader>(
        "INSERT INTO WorkoutTemplates(userId, lastDate, name) VALUES(?, ?, 'New Workout Template');",
        [userId, now]
    );
    await conn.end();

    // THE FIX: Return the new ID in a JSON object
    return NextResponse.json({ workoutId: insertResults.insertId }, { status: 201 });

  } catch (error) {
    console.error("Error creating empty workout:", error);
    return NextResponse.json({ message: "Failed to create workout" }, { status: 500 });
  }
}