// src/components/ExerciseAddModal.tsx
'use client';

import { useState, useEffect } from 'react';

// This interface defines the shape of the exercise data we work with inside this component.
interface NewExerciseInfo {
    exerciseId: number;
    name: string;
    like: boolean | null; // This will be passed back to the parent
}

// These are the props the component accepts from its parent (EditableWorkout)
interface ExerciseAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExercise: (exercise: NewExerciseInfo) => void;
}

export default function ExerciseAddModal({ isOpen, onClose, onSelectExercise }: ExerciseAddModalProps) {
    // State to hold the list of exercises fetched from the API
    const [exercises, setExercises] = useState<NewExerciseInfo[]>([]);
    // State to manage the loading status to give user feedback
    const [isLoading, setIsLoading] = useState(true);
    // State for the search input
    const [searchTerm, setSearchTerm] = useState('');
    
    // This useEffect hook runs when the modal is opened.
    // Its job is to fetch the list of exercises from our new API endpoint.
    useEffect(() => {
        // We only want to fetch data if the modal is open.
        if (isOpen) {
            setIsLoading(true); // Set loading to true before we start the fetch

            const fetchExercises = async () => {
                try {
                    const response = await fetch('/api/exercises');
                    if (!response.ok) {
                        throw new Error('Failed to fetch data from server');
                    }
                    const data = await response.json();
                    
                    // The API returns { exercises: [...] }, so we access the array
                    // and add the default `like: null` property for each.
                    const exercisesWithLike = data.exercises.map((ex: any) => ({
                        ...ex,
                        like: null,
                    }));

                    setExercises(exercisesWithLike);

                } catch (error) {
                    console.error("Error fetching exercises:", error);
                    setExercises([]); // Clear exercises on error to avoid showing stale data
                } finally {
                    // This runs whether the fetch succeeded or failed.
                    setIsLoading(false);
                }
            };

            fetchExercises();
        }
    }, [isOpen]); // The hook re-runs whenever the 'isOpen' prop changes.


    if (!isOpen) {
        return null;
    }
    
    // Filter the fetched exercises based on what the user types in the search bar
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (exercise: NewExerciseInfo) => {
        onSelectExercise(exercise);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md text-gray-800">
                <h2 className="text-xl font-bold mb-4">Add Exercise</h2>
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                />
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {isLoading ? (
                        <p className="p-3 text-gray-500">Loading exercises...</p>
                    ) : filteredExercises.length > 0 ? (
                        filteredExercises.map(ex => (
                            <button
                                key={ex.exerciseId}
                                onClick={() => handleSelect(ex)}
                                className="w-full text-left p-3 my-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
                            >
                                {ex.name}
                            </button>
                        ))
                    ) : (
                        <p className="p-3 text-gray-500">No exercises found.</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}