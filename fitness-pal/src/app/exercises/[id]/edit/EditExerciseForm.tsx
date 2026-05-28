'use client';

import { useActionState } from 'react';
import { updateExercise, State, ExerciseDataForEditForm, MuscleData } from '../../actions';
import Link from 'next/link';

interface EditExerciseFormProps {
    exercise: ExerciseDataForEditForm;
    allMuscles: MuscleData[];
}

export function EditExerciseForm({ exercise, allMuscles }: EditExerciseFormProps) {
    const initialState: State = { message: null, errors: {} };
    const updateExerciseWithId = updateExercise.bind(null, exercise.exerciseId);
    const [state, dispatch] = useActionState(updateExerciseWithId, initialState);

    return (
        <main className="w-full h-fit flex-wrap bg-emerald-700 rounded p-4">
            <h1 className="font-bold w-full text-center text-xl mb-4">Edit Exercise</h1>
            <form action={dispatch} className="max-w-lg mx-auto bg-emerald-600 p-6 rounded-lg shadow-md">
                {/* Name Field */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-white font-bold mb-2">Exercise Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        defaultValue={exercise.name}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                        aria-describedby="name-error"
                    />
                    <div id="name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name && state.errors.name.map((error: string) => (
                            <p className="mt-2 text-sm text-red-400" key={error}>{error}</p>
                        ))}
                    </div>
                </div>

                {/* Description Field */}
                <div className="mb-4">
                    <label htmlFor="description" className="block text-white font-bold mb-2">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={exercise.description}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    />
                </div>

                {/* Muscles Checkboxes */}
                <div className="mb-6">
                    <label className="block text-white font-bold mb-2">Target Muscles</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-4 rounded max-h-60 overflow-y-auto">
                        {allMuscles.map(muscle => (
                            <div key={muscle.muscleId} className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id={`muscle-${muscle.muscleId}`} 
                                    name="muscles" 
                                    value={muscle.muscleId} 
                                    defaultChecked={exercise.muscleIds.includes(muscle.muscleId)}
                                    className="mr-2" 
                                />
                                <label htmlFor={`muscle-${muscle.muscleId}`} className="text-gray-800">{muscle.name}</label>
                            </div>
                        ))}
                    </div>
                    <div id="muscles-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.muscles && state.errors.muscles.map((error: string) => (
                            <p className="mt-2 text-sm text-red-400" key={error}>{error}</p>
                        ))}
                    </div>
                </div>

                {state.message && (
                    <div aria-live="polite" aria-atomic="true">
                        <p className="mt-2 text-sm text-red-400">{state.message}</p>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Link href={`/exercises/${exercise.exerciseId}`} className="inline-block align-baseline font-bold text-sm text-blue-300 hover:text-blue-100">
                        Cancel
                    </Link>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Save Changes
                    </button>
                </div>
            </form>
        </main>
    );
}
