import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from 'mysql2/promise'
import { env, isDemoMode } from '@/src/env'
import { auth } from '@/src/utils/auth'
import { demoReadOnlyResponse } from '@/src/app/api/demoMode'

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (isDemoMode) {
    return demoReadOnlyResponse('delete workouts')
  }

  const { workoutId } = await req.json();
  const userId = session.user.id

  const conn = await createConnection(env.DATABASE_URL!);

  await conn.execute(
    `DELETE FROM WorkoutTemplates WHERE userId = ? AND workoutId = ?`,
    [userId, workoutId]
  );

  await conn.end();

  return NextResponse.json({ message: 'Workout deleted' }, { status: 200 });
}
