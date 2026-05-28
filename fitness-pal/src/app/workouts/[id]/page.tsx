// src/app/workouts/[id]/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/src/utils/auth'; // Make sure this path is correct
import EditableWorkout from '@/src/components/EditableWorkout'; // Make sure this path is correct
import { pool } from '@/src/database/pool'; // You'll need to import your database connection pool

// Define the shape of the data we expect
interface WorkoutData {
    lastDate: Date;
    name: string;
    lastDuration: number;
    // Add any other fields from your DB query
}

interface ExerciseData {
    id: string; // Unique client-side ID
    exerciseId: number; // DB ID
    name: string;
    like: boolean | null;
    order: number;
    sets: SetData[];
}

interface SetData {
    id: string; // Unique client-side ID
    dbSetId?: number; // DB ID
    order: number;
    lbs: number;
    reps: number;
}


// Define the component's props with clear types
interface Props {
  params: Promise<{ id: string }>;
}

// --- Example Data Fetching Function ---
// This is a robust way to fetch your data. You should adapt this to your actual DB calls.
async function getWorkoutAndExerciseData(workoutId: string, userId: string) {
  try {
    // Fetch the main workout data
    const [workoutRows]: any = await pool.query(
      "SELECT name, lastDate, lastDuration FROM WorkoutTemplates WHERE workoutId = ? AND userId = ?",
      [workoutId, userId]
    );

    if (workoutRows.length === 0) {
      // Handle case where workout is not found
      // You could redirect or show a 'not found' message
      // For now, let's return nulls
      return { workoutData: null, exercises: [] };
    }
    
    const workoutData = {
        name: workoutRows[0].name,
        lastDate: workoutRows[0].lastDate,
        lastDuration: workoutRows[0].lastDuration || 0
    };

    // Fetch the exercises and their sets for this workout
    // This is a more complex query that joins multiple tables
    const [exerciseRows]: any = await pool.query(
      `SELECT
          wc.exerciseId,
          e.name,
          wc.order AS exerciseOrder,
          s.setId,
          s.order AS setOrder,
          s.lbs,
          s.reps
      FROM WorkoutContents wc
      JOIN Exercises e ON wc.exerciseId = e.exerciseId
      LEFT JOIN Sets s ON wc.exerciseId = s.exerciseId AND wc.userId = s.userId
      WHERE wc.workoutId = ? AND wc.userId = ?
      ORDER BY exerciseOrder, setOrder`,
      [workoutId, userId]
    );

    // Now, process the flat SQL result into the nested structure React needs
    const exercisesMap = new Map();
    for (const row of exerciseRows) {
        if (!exercisesMap.has(row.exerciseId)) {
            exercisesMap.set(row.exerciseId, {
                id: `client-exercise-${row.exerciseId}`,
                exerciseId: row.exerciseId,
                name: row.name,
                like: null, // You might need another query to get this
                order: row.exerciseOrder,
                sets: [],
            });
        }
        
        if (row.setId) { // Only add a set if it exists
            const exercise = exercisesMap.get(row.exerciseId);
            exercise.sets.push({
                id: `client-set-${row.setId}`,
                dbSetId: row.setId,
                order: row.setOrder,
                lbs: row.lbs,
                reps: row.reps
            });
        }
    }

    const exercises = Array.from(exercisesMap.values());

    return { workoutData, exercises };

  } catch (error) {
    console.error("Failed to fetch workout data:", error);
    // In case of a database error, return empty/null data to prevent crashes
    return { workoutData: null, exercises: [] };
  }
}


export default async function Workout({ params }: Props) {
    // THE FIX: Destructure `id` from `params` immediately at the top of the function.
    const { id } = await params;
    
    // Now, we will use the `id` variable (not `params.id`) everywhere else.
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/api/auth/signin?callbackUrl=/dashboard');
    }

    // Use the `id` variable here
    const { workoutData, exercises } = await getWorkoutAndExerciseData(id, userId);

    if (!workoutData) {
        return (
            <div className="mt-8 text-center">
                <h1 className="text-2xl font-bold">Workout Not Found</h1>
                <p className="text-gray-600">This workout may have been deleted or you may not have access.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 text-center">
            <EditableWorkout 
                // And use the `id` variable here
                workoutId={id} 
                userId={userId} 
                workoutData={workoutData}
                exercises={exercises}
            />
        </div>
    );
}