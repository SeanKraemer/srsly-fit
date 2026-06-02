import { NextResponse } from 'next/server';
import { auth } from '@/src/utils/auth';
import { getExerciseOptions } from '@/src/data/fitnessData';
import { isDemoMode } from '@/src/env';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id && !isDemoMode) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const exercises = await getExerciseOptions(session?.user?.id);
        return NextResponse.json({ exercises }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch exercises:', error);
        
        return NextResponse.json(
            { message: 'Error fetching exercises from the database.' },
            { status: 500 }
        );
    }
}
