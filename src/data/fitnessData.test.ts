import { describe, expect, it } from 'vitest'

import {
  aggregateWorkoutExerciseRows,
  filterDemoExerciseDetails,
  parseMuscleIds,
} from './fitnessData'
import { demoUser } from './demoData'

describe('parseMuscleIds', () => {
  it('keeps only positive integer muscle IDs', () => {
    expect(parseMuscleIds('1,2,nope,0,-1,5')).toEqual([1, 2, 5])
  })
})

describe('filterDemoExerciseDetails', () => {
  it('filters demo exercises by keyword and current user visibility', () => {
    const matches = filterDemoExerciseDetails(demoUser.id, 'press', '')

    expect(matches.map((exercise) => exercise.name)).toEqual(['Push-Up', 'Half-Kneeling Press'])
  })

  it('filters demo exercises by selected muscle', () => {
    const matches = filterDemoExerciseDetails(demoUser.id, '', '3')

    expect(matches.map((exercise) => exercise.name)).toEqual(['Goblet Squat'])
  })

  it('does not expose custom exercises owned by another user', () => {
    const matches = filterDemoExerciseDetails('2', 'press', '')

    expect(matches.map((exercise) => exercise.name)).toEqual(['Push-Up'])
  })
})

describe('aggregateWorkoutExerciseRows', () => {
  it('groups flat SQL rows into editable exercises with ordered sets', () => {
    const exercises = aggregateWorkoutExerciseRows([
      {
        exerciseId: 7,
        name: 'Row',
        exerciseOrder: 0,
        like: true,
        setId: 10,
        setOrder: 0,
        lbs: 40,
        reps: 10,
      },
      {
        exerciseId: 7,
        name: 'Row',
        exerciseOrder: 0,
        like: true,
        setId: 11,
        setOrder: 1,
        lbs: 45,
        reps: 8,
      },
      {
        exerciseId: 8,
        name: 'Plank',
        exerciseOrder: 1,
        like: null,
        setId: null,
        setOrder: null,
        lbs: null,
        reps: null,
      },
    ])

    expect(exercises).toEqual([
      {
        id: 'client-exercise-7',
        exerciseId: 7,
        name: 'Row',
        like: true,
        order: 0,
        sets: [
          { id: 'client-set-10', dbSetId: 10, order: 0, lbs: 40, reps: 10 },
          { id: 'client-set-11', dbSetId: 11, order: 1, lbs: 45, reps: 8 },
        ],
      },
      {
        id: 'client-exercise-8',
        exerciseId: 8,
        name: 'Plank',
        like: null,
        order: 1,
        sets: [],
      },
    ])
  })
})
