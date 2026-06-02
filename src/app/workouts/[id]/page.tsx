// src/app/workouts/[id]/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@/src/utils/auth';
import EditableWorkout from '@/src/components/EditableWorkout';
import { getWorkoutDetail } from '@/src/data/fitnessData';


// Define the component's props with clear types
interface Props {
  params: Promise<{ id: string }>;
}

export default async function Workout({ params }: Props) {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        redirect('/api/auth/signin?callbackUrl=/dashboard');
    }

    const { workoutData, exercises } = await getWorkoutDetail(id, userId);

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
                workoutId={id} 
                userId={userId} 
                workoutData={workoutData}
                exercises={exercises}
            />
        </div>
    );
}
