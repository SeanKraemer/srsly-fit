'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ExerciseAddModal from './ExerciseAddModal';
import WorkoutTracker from './WorkoutTracker';


interface WorkoutData {
    lastDate: Date | string;
    name: string;
    lastDuration: number;
}

interface SetData {
    id: string; 
    dbSetId?: number; 
    order: number;
    lbs: number;
    reps: number;
}

interface ExerciseData {
    id: string; 
    exerciseId: number; 
    name: string;
    like: boolean | null;
    order: number;
    sets: SetData[];
}

interface NewExerciseInfo {
    exerciseId: number;
    name: string;
    like: boolean | null;
}

interface Props {
    workoutId: string;
    userId: string;
    workoutData: WorkoutData;
    exercises: ExerciseData[];
}

function SortableSet({ set, exerciseId, onSetChange, onRemoveSet }: { set: SetData, exerciseId: string, onSetChange: (exerciseId: string, setId: string, field: 'lbs' | 'reps', value: number) => void, onRemoveSet: (exerciseId: string, setId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: set.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 my-1 bg-gray-50 rounded-lg shadow-sm">
      <div {...listeners} {...attributes} className="cursor-grab p-2 -ml-2 mr-2 text-gray-400 hover:text-gray-600 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 text-sm font-medium text-gray-700">Set {set.order + 1}</div>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col items-center">
          <label htmlFor={`lbs-${set.id}`} className="text-xs text-gray-500">Lbs</label>
          <input
            id={`lbs-${set.id}`}
            type="number"
            value={set.lbs ?? 0}
            onChange={(e) => onSetChange(exerciseId, set.id, 'lbs', parseInt(e.target.value) || 0)}
            className="w-16 p-1 text-center border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor={`reps-${set.id}`} className="text-xs text-gray-500">Reps</label>
          <input
            id={`reps-${set.id}`}
            type="number"
            value={set.reps ?? 0}
            onChange={(e) => onSetChange(exerciseId, set.id, 'reps', parseInt(e.target.value) || 0)}
            className="w-16 p-1 text-center border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
        <button
          onClick={() => onRemoveSet(exerciseId, set.id)}
          className="p-2 text-red-500 hover:text-red-700 rounded-full"
          aria-label="Remove set"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SortableExercise({ exercise, onAddSet, onRemoveExercise, onSetChange, onRemoveSet, onDragEndSets }: {
  exercise: ExerciseData,
  onAddSet: (exerciseId: string) => void,
  onRemoveExercise: (exerciseId: string) => void,
  onSetChange: (exerciseId: string, setId: string, field: 'lbs' | 'reps', value: number) => void,
  onRemoveSet: (exerciseId: string, setId: string) => void,
  onDragEndSets: (exerciseId: string, event: DragEndEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 cursor-grab" {...attributes} {...listeners}>{exercise.name}</h3>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-500 hover:text-gray-700 rounded-full" aria-label="Exercise options">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <button
            onClick={() => onRemoveExercise(exercise.id)}
            className="p-1 text-red-500 hover:text-red-700 rounded-full"
            aria-label="Remove exercise"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onDragEndSets(exercise.id, event)}>
        <SortableContext items={exercise.sets.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {exercise.sets.map((set) => (
            <SortableSet key={set.id} set={set} exerciseId={exercise.id} onSetChange={onSetChange} onRemoveSet={onRemoveSet} />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={() => onAddSet(exercise.id)}
        className="w-full py-2 mt-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
      >
        + Add Set
      </button>
    </div>
  );
}


export default function EditableWorkout({ workoutId, userId, workoutData, exercises: initialExercises }: Props) {
    const router = useRouter();
    const [exercises, setExercises] = useState<ExerciseData[]>(
        initialExercises.map(ex => ({
            ...ex,
            id: ex.id || `exercise-${ex.exerciseId}-${Math.random().toString(36).substr(2, 9)}`,
            sets: ex.sets.map(s => ({
                ...s,
                id: s.id || `set-${s.dbSetId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            }))
        }))
    );
    const [currentWorkoutName, setCurrentWorkoutName] = useState(workoutData.name || '');
    const [duration, setDuration] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isTimerRunning]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSetChange = useCallback((exerciseId: string, setId: string, field: 'lbs' | 'reps', value: number) => {
        setExercises(prevExercises =>
            prevExercises.map(exercise =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map(set =>
                            set.id === setId ? { ...set, [field]: value } : set
                        ),
                    }
                    : exercise
            )
        );
    }, []);

    const handleAddSet = useCallback((exerciseId: string) => {
        setExercises(prevExercises =>
            prevExercises.map(exercise => {
                if (exercise.id === exerciseId) {
                    const newSet: SetData = {
                        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        order: exercise.sets.length,
                        lbs: 0,
                        reps: 0,
                    };
                    return {
                        ...exercise,
                        sets: [...exercise.sets, newSet],
                    };
                }
                return exercise;
            })
        );
    }, []);

    const handleRemoveSet = useCallback((exerciseId: string, setId: string) => {
        setExercises(prevExercises =>
            prevExercises.map(exercise =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.filter(set => set.id !== setId).map((set, index) => ({ ...set, order: index })),
                    }
                    : exercise
            )
        );
    }, []);
    
    const handleAddExercise = useCallback((newExerciseData: NewExerciseInfo) => {
        setExercises(prevExercises => {
            const newExercise: ExerciseData = {
                id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...newExerciseData,
                order: prevExercises.length,
                sets: [], // Start with an empty set array
            };
            return [...prevExercises, newExercise];
        });
        setIsAddExerciseModalOpen(false); // Close modal after adding
    }, []);

    const handleRemoveExercise = useCallback((exerciseId: string) => {
        setExercises(prevExercises =>
            prevExercises.filter(exercise => exercise.id !== exerciseId).map((exercise, index) => ({ ...exercise, order: index }))
        );
    }, []);

    const handleDragEndExercises = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setExercises((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                if (oldIndex === -1 || newIndex === -1) return items;

                const newItems = Array.from(items);
                const [movedItem] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, movedItem);

                return newItems.map((item, index) => ({ ...item, order: index }));
            });
        }
    }, []);

    const handleDragEndSets = useCallback((exerciseId: string, event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setExercises(prevExercises =>
                prevExercises.map(exercise => {
                    if (exercise.id === exerciseId) {
                        const oldIndex = exercise.sets.findIndex((set) => set.id === active.id);
                        const newIndex = exercise.sets.findIndex((set) => set.id === over?.id);
                        if (oldIndex === -1 || newIndex === -1) return exercise;

                        const newSets = Array.from(exercise.sets);
                        const [movedSet] = newSets.splice(oldIndex, 1);
                        newSets.splice(newIndex, 0, movedSet);

                        return {
                            ...exercise,
                            sets: newSets.map((set, index) => ({ ...set, order: index })),
                        };
                    }
                    return exercise;
                })
            );
        }
    }, []);

    const saveWorkout = async (finishWorkout: boolean) => {
        setIsTimerRunning(false); // Pause timer before saving
        setIsLoading(true);
        setMessage('');
        try {
            const endpoint = finishWorkout ? `/api/finishedWorkout` : `/api/onlySavedWorkout`;
            const payload = {
                workoutId,
                userId,
                workoutData: {
                    name: currentWorkoutName,
                    lastDate: new Date(),
                    lastDuration: duration,
                },
                exercises: exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    name: ex.name,
                    like: ex.like,
                    order: ex.order,
                    sets: ex.sets.map(s => ({
                        setId: s.dbSetId || null,
                        order: s.order,
                        lbs: s.lbs,
                        reps: s.reps,
                    })),
                })),
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save workout');
            }

            await response.json();
            setMessage(finishWorkout ? 'Workout finished and saved successfully!' : 'Workout saved successfully!');

            // If the workout was finished, reset the timer to 0.
            if (finishWorkout) {
                setDuration(0);
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setMessage(`Error saving workout: ${message}`);
            console.error('Error saving workout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestExercise = useCallback(async () => {
        setIsSuggesting(true);
        setMessage('');

        try {
            const response = await fetch('/api/workouts/suggest-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workoutId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get a suggestion.');
            }
            
            const { suggestedExercise } = data;

            handleAddExercise({
                exerciseId: suggestedExercise.exerciseId,
                name: suggestedExercise.name,
                like: null,
            });

            setMessage(`Added suggested exercise: ${suggestedExercise.name}!`);

        } catch (error: unknown) {
            console.error("Error suggesting exercise:", error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setMessage(`Suggestion failed: ${message}`);
        } finally {
            setIsSuggesting(false);
        }
    }, [workoutId, handleAddExercise]); // Dependencies for the function
    
    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.back()} className="p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200" aria-label="Back">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => saveWorkout(true)}
                        className="px-6 py-2 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Finishing...' : 'Finish'}
                    </button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        value={currentWorkoutName}
                        onChange={(e) => setCurrentWorkoutName(e.target.value)}
                        className="w-full text-2xl font-bold text-gray-900 mb-1 p-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        aria-label="Workout Name"
                    />
                    <div className="text-gray-600 text-sm flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(workoutData.lastDate).toLocaleDateString()}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <WorkoutTracker
                            duration={duration}
                        />
                        <div className="flex items-center ml-2 space-x-1">
                            {!isTimerRunning ? (
                                <button onClick={() => setIsTimerRunning(true)} className="p-1 text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition-colors" aria-label="Start timer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            ) : (
                                <button onClick={() => setIsTimerRunning(false)} className="p-1 text-yellow-600 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors" aria-label="Pause timer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExercises}>
                    <SortableContext items={exercises.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
                        {exercises.map((exercise) => (
                            <SortableExercise
                                key={exercise.id}
                                exercise={exercise}
                                onAddSet={handleAddSet}
                                onRemoveExercise={handleRemoveExercise}
                                onSetChange={handleSetChange}
                                onRemoveSet={handleRemoveSet}
                                onDragEndSets={handleDragEndSets}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <button
                    onClick={() => setIsAddExerciseModalOpen(true)}
                    className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Exercise
                </button>

                <button
                    onClick={handleSuggestExercise}
                    disabled={isSuggesting}
                    className="w-full py-3 mt-3 bg-teal-600 text-white font-semibold rounded-xl shadow-md hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center disabled:bg-teal-400 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1" />
                    </svg>
                    {isSuggesting ? 'Thinking...' : 'Suggest an Exercise'}
                </button>

                <button
                    onClick={() => saveWorkout(false)}
                    className="w-full py-3 mt-3 bg-gray-200 text-gray-800 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition-colors duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Workout'}
                </button>
                
                <ExerciseAddModal
                    isOpen={isAddExerciseModalOpen}
                    onClose={() => setIsAddExerciseModalOpen(false)}
                    onSelectExercise={handleAddExercise}
                />
            </div>
        </div>
    );
}
