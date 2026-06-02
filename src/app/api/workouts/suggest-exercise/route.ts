import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { getSuggestedExercise } from '@/src/data/fitnessData';

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

        const suggestedExercise = await getSuggestedExercise(userId, String(workoutId));
        if (!suggestedExercise) {
            return NextResponse.json(
                { message: 'No suitable exercise suggestions found. Try adding more exercises or completing some!' },
                { status: 404 }
            );
        }

        return NextResponse.json({ suggestedExercise }, { status: 200 });

    } catch (error) {
        console.error('Failed to suggest an exercise:', error);
        return NextResponse.json(
            { message: 'An error occurred while suggesting an exercise.' },
            { status: 500 }
        );
    }
}
