// src/app/api/exercises/route.ts

// Imports for the entire file
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { pool } from '@/src/database/pool'; // We will ONLY use the pool
import { ResultSetHeader } from "mysql2/promise";

// --- DELETE Function (Refactored to use the pool) ---
export async function DELETE(request: Request) {
  // Get a connection from the pool. This is much faster than creating a new one.
  const conn = await pool.getConnection(); 
  
  try {
    const body = await request.json();
    const exerciseId = body.exerciseId || body.workoutId;
    const userId = body.userId;

    if (!exerciseId || !userId) {
      return NextResponse.json({ message: "Missing exerciseId or userId" }, { status: 400 });
    }

    // Start a transaction on this specific connection
    await conn.beginTransaction();

    // Delete from the junction table
    await conn.execute('DELETE FROM ExercisesMuscles WHERE exerciseId = ?', [exerciseId]);

    // Delete the exercise itself
    const [result] = await conn.execute<ResultSetHeader>(
      'DELETE FROM Exercises WHERE exerciseId = ? AND ownerId = ?',
      [exerciseId, userId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback(); // Rollback if nothing was deleted
      return NextResponse.json({ message: "Exercise not found or you don't have permission to delete it." }, { status: 404 });
    }

    // If all went well, commit the changes
    await conn.commit();

    revalidatePath('/exercises');
    return NextResponse.json({ success: true });

  } catch (error) {
    // If any error occurred, rollback the transaction
    await conn.rollback();
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ message: "Failed to delete exercise" }, { status: 500 });

  } finally {
    // VERY IMPORTANT: Release the connection back to the pool for others to use.
    // This happens whether the try block succeeded or failed.
    if (conn) conn.release();
  }
}


// --- GET Function (Already correct) ---
// export async function GET() {
//   try {
//     // This function correctly uses the pool already
//     const [rows]: any = await pool.query(
//       "SELECT exerciseId, name FROM Exercises"
//     );
    
//     return NextResponse.json({ exercises: rows }, { status: 200 });

//   } catch (error) {
//     console.error('Failed to fetch exercises:', error);
//     return NextResponse.json(
//       { message: 'Error fetching exercises from the database.' },
//       { status: 500 }
//     );
//   }
// }