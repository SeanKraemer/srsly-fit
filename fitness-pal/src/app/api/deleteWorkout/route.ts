import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from 'mysql2/promise'
import { env } from '@/src/env'

export async function DELETE(req: NextRequest) {
  const { workoutId, userId } = await req.json(); // TODO: replace userId with a cookie or something later

  const conn = await createConnection(env.DATABASE_URL);

  await conn.execute(
    `DELETE FROM WorkoutTemplates WHERE userId = ? AND workoutId = ?`,
    [userId, workoutId]
  );

  await conn.end();

  return NextResponse.json({ message: 'Workout deleted' }, { status: 200 });
}
