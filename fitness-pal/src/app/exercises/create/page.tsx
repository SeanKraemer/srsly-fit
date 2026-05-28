import { createConnection, Connection } from 'mysql2/promise';
import { env } from '@/src/env';
import { CreateExerciseForm } from './CreateExerciseForm';
import { MuscleData } from '../actions';

export default async function CreateExercisePage() {
    let conn: Connection | undefined;
    let muscles: MuscleData[] = [];
    try {
        conn = await createConnection(env.DATABASE_URL);
        [muscles] = await conn.execute<MuscleData[]>(
            'SELECT muscleId, name FROM Muscles ORDER BY name ASC'
        );

    } catch (error) {
        console.error("Failed to fetch muscles for create page:", error);
        return <p className="text-center text-white p-4">Could not load page data. Please try again later.</p>;
    } finally {
        if (conn) await conn.end();
    }

    return (
        <CreateExerciseForm muscles={muscles} />
    );
}