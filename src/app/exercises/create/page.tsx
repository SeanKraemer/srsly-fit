import { CreateExerciseForm } from './CreateExerciseForm';
import { getMuscles } from '@/src/data/fitnessData';

export const dynamic = 'force-dynamic';

export default async function CreateExercisePage() {
    try {
        const muscles = await getMuscles();
        return <CreateExerciseForm muscles={muscles} />;
    } catch (error) {
        console.error("Failed to fetch muscles for create page:", error);
        return <p className="text-center text-white p-4">Could not load page data. Please try again later.</p>;
    }
}
