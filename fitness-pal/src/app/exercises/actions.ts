'use server';

import { createConnection, RowDataPacket, Connection, ResultSetHeader } from 'mysql2/promise';
import { env } from '@/src/env';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/src/utils/auth';

// Shared State and Schema
export type State = {
    errors?: {
        name?: string[];
        description?: string[];
        muscles?: string[];
    };
    message?: string | null;
};

const ExerciseSchema = z.object({
    name: z.string().min(1, "Name is required."),
    description: z.string().optional(),
    muscles: z.array(z.string()).min(1, "At least one muscle must be selected."),
});

// Interfaces for component props
export interface ExerciseDataForEditForm extends RowDataPacket {
    exerciseId: number;
    name: string;
    description: string;
    ownerId: number;
    muscleIds: number[];
}

export interface MuscleData extends RowDataPacket {
    muscleId: number;
    name: string;
}

// createExercise action
export async function createExercise(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = ExerciseSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        muscles: formData.getAll('muscles'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to create exercise. Please check the fields.',
        };
    }

    const { name, description, muscles } = validatedFields.data;
    const session = await auth();
    if (!session?.user?.id) {
        // This should ideally not happen if the page is protected, but as a safeguard:
        return { message: 'You must be logged in to create an exercise.' };
    }
    const ownerId = session.user.id;

    let conn: Connection | undefined;
    try {
        conn = await createConnection(env.DATABASE_URL);
        await conn.beginTransaction();

        const [result] = await conn.execute(
            'INSERT INTO Exercises (name, description, ownerId) VALUES (?, ?, ?)',
            [name, description, ownerId]
        );
        const exerciseId = (result as any).insertId;

        const muscleValues = muscles.map(muscleId => [exerciseId, parseInt(muscleId, 10)]);
        if (muscleValues.length > 0) {
            await conn.query('INSERT INTO ExercisesMuscles (exerciseId, muscleId) VALUES ?', [muscleValues]);
        }

        await conn.commit();
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Database error:', error);
        return { message: 'Database Error: Failed to create exercise.' };
    } finally {
        if (conn) await conn.end();
    }

    revalidatePath('/exercises');
    redirect('/exercises');
}

// updateExercise action
export async function updateExercise(exerciseId: number, prevState: State, formData: FormData): Promise<State> {
    const validatedFields = ExerciseSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        muscles: formData.getAll('muscles'),
    });
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to update exercise. Please check the fields.',
        };
    }

    const { name, description, muscles } = validatedFields.data;
    const session = await auth();
    if (!session?.user?.id) {
        // This should ideally not happen if the page is protected, but as a safeguard:
        return { message: 'You must be logged in to update an exercise.' };
    }
    const ownerId = session.user.id;

    let conn: Connection | undefined;
    try {
        conn = await createConnection(env.DATABASE_URL);
        await conn.beginTransaction();

        // Check if user owns the exercise before updating
        const [ownerCheck] = await conn.execute<RowDataPacket[]>(
            'SELECT ownerId FROM Exercises WHERE exerciseId = ?',
            [exerciseId]
        );

        if (ownerCheck.length === 0 || ownerCheck[0].ownerId !== Number(ownerId)) {
            await conn.rollback();
            return { message: 'Error: You do not have permission to edit this exercise.' };
        }

        // Update exercise details
        await conn.execute(
            'UPDATE Exercises SET name = ?, description = ? WHERE exerciseId = ? AND ownerId = ?',
            [name, description, exerciseId, Number(ownerId)]
        );

        // Delete old muscle associations and insert new ones
        await conn.execute('DELETE FROM ExercisesMuscles WHERE exerciseId = ?', [exerciseId]);
        const muscleValues = muscles.map(muscleId => [exerciseId, parseInt(muscleId, 10)]);
        if (muscleValues.length > 0) {
            await conn.query('INSERT INTO ExercisesMuscles (exerciseId, muscleId) VALUES ?', [muscleValues]);
        }

        await conn.commit();
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Database error:', error);
        return { message: 'Database Error: Failed to update exercise.' };
    } finally {
        if (conn) await conn.end();
    }

    revalidatePath('/exercises');
    revalidatePath(`/exercises/${exerciseId}`);
    redirect(`/exercises/${exerciseId}`);
}