import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getPool } from '@/src/database/pool';
import { ResultSetHeader } from "mysql2/promise";
import { isDemoMode } from "@/src/env";
import { auth } from "@/src/utils/auth";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (isDemoMode) {
    return NextResponse.json(
      { message: "Demo mode is read-only. Switch APP_MODE to live and configure MySQL to delete exercises." },
      { status: 403 },
    );
  }

  const conn = await getPool().getConnection();
  
  try {
    const body = await request.json();
    const exerciseId = body.exerciseId || body.workoutId;
    const userId = session.user.id;

    if (!exerciseId || !userId) {
      return NextResponse.json({ message: "Missing exerciseId or userId" }, { status: 400 });
    }

    await conn.beginTransaction();

    await conn.execute('DELETE FROM ExercisesMuscles WHERE exerciseId = ?', [exerciseId]);

    const [result] = await conn.execute<ResultSetHeader>(
      'DELETE FROM Exercises WHERE exerciseId = ? AND ownerId = ?',
      [exerciseId, userId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ message: "Exercise not found or you don't have permission to delete it." }, { status: 404 });
    }

    await conn.commit();

    revalidatePath('/exercises');
    return NextResponse.json({ success: true });

  } catch (error) {
    await conn.rollback();
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ message: "Failed to delete exercise" }, { status: 500 });

  } finally {
    if (conn) conn.release();
  }
}
