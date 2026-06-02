import type {
  EditableExercise,
  ExerciseDetails,
  ExerciseSummary,
  MuscleData,
  WorkoutData,
  WorkoutTemplateData,
} from './fitnessData'

export const demoUser = {
  id: '1',
  name: 'Demo User',
  username: 'demo',
  password: 'demo',
}

export const demoMuscles: MuscleData[] = [
  { muscleId: 1, name: 'Chest' },
  { muscleId: 2, name: 'Back' },
  { muscleId: 3, name: 'Legs' },
  { muscleId: 4, name: 'Shoulders' },
  { muscleId: 5, name: 'Core' },
]

export const demoExercises: ExerciseDetails[] = [
  {
    exerciseId: 1,
    name: 'Push-Up',
    description: 'Bodyweight press focused on chest, shoulders, and triceps.',
    ownerId: null,
    muscles: ['Chest', 'Shoulders'],
  },
  {
    exerciseId: 2,
    name: 'Goblet Squat',
    description: 'Squat variation that trains legs and core control.',
    ownerId: null,
    muscles: ['Legs', 'Core'],
  },
  {
    exerciseId: 3,
    name: 'Dumbbell Row',
    description: 'Single-arm pull that targets the upper back.',
    ownerId: null,
    muscles: ['Back'],
  },
  {
    exerciseId: 4,
    name: 'Plank',
    description: 'Isometric core hold for trunk stability.',
    ownerId: null,
    muscles: ['Core'],
  },
  {
    exerciseId: 5,
    name: 'Half-Kneeling Press',
    description: 'Single-arm overhead press emphasizing shoulder control.',
    ownerId: 1,
    muscles: ['Shoulders', 'Core'],
  },
]

export const demoWorkoutTemplates: WorkoutTemplateData[] = [
  {
    workoutId: 1,
    lastDate: '2026-05-24T14:30:00',
    name: 'Upper Body Strength',
    lastDuration: 2180,
  },
  {
    workoutId: 2,
    lastDate: '2026-05-21T12:15:00',
    name: 'Lower Body Reset',
    lastDuration: 1865,
  },
  {
    workoutId: 3,
    lastDate: '2026-05-18T17:45:00',
    name: 'Core Stability',
    lastDuration: 1520,
  },
]

export const demoWorkoutDetails: Record<string, { workoutData: WorkoutData, exercises: EditableExercise[] }> = {
  '1': {
    workoutData: {
      name: 'Upper Body Strength',
      lastDate: '2026-05-24T14:30:00',
      lastDuration: 2180,
    },
    exercises: [
      {
        id: 'client-exercise-1',
        exerciseId: 1,
        name: 'Push-Up',
        like: true,
        order: 0,
        sets: [
          { id: 'client-set-1', dbSetId: 1, order: 0, lbs: 0, reps: 15 },
          { id: 'client-set-2', dbSetId: 2, order: 1, lbs: 0, reps: 12 },
        ],
      },
      {
        id: 'client-exercise-3',
        exerciseId: 3,
        name: 'Dumbbell Row',
        like: true,
        order: 1,
        sets: [
          { id: 'client-set-3', dbSetId: 3, order: 0, lbs: 40, reps: 10 },
          { id: 'client-set-4', dbSetId: 4, order: 1, lbs: 40, reps: 10 },
        ],
      },
    ],
  },
  '2': {
    workoutData: {
      name: 'Lower Body Reset',
      lastDate: '2026-05-21T12:15:00',
      lastDuration: 1865,
    },
    exercises: [
      {
        id: 'client-exercise-2',
        exerciseId: 2,
        name: 'Goblet Squat',
        like: null,
        order: 0,
        sets: [
          { id: 'client-set-5', dbSetId: 5, order: 0, lbs: 45, reps: 12 },
          { id: 'client-set-6', dbSetId: 6, order: 1, lbs: 45, reps: 10 },
        ],
      },
    ],
  },
  '3': {
    workoutData: {
      name: 'Core Stability',
      lastDate: '2026-05-18T17:45:00',
      lastDuration: 1520,
    },
    exercises: [
      {
        id: 'client-exercise-4',
        exerciseId: 4,
        name: 'Plank',
        like: true,
        order: 0,
        sets: [
          { id: 'client-set-7', dbSetId: 7, order: 0, lbs: 0, reps: 45 },
          { id: 'client-set-8', dbSetId: 8, order: 1, lbs: 0, reps: 45 },
        ],
      },
    ],
  },
}

export function toExerciseSummary(exercise: ExerciseDetails): ExerciseSummary {
  return {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    ownerId: exercise.ownerId,
    muscles: exercise.muscles,
  }
}
