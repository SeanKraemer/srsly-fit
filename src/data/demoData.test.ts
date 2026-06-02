import { describe, expect, it } from 'vitest'

import { demoUser, demoWorkoutDetails, demoWorkoutTemplates } from './demoData'

describe('demo data assumptions', () => {
  it('keeps the public demo login stable', () => {
    expect(demoUser).toMatchObject({
      id: '1',
      username: 'demo',
      password: 'demo',
      name: 'Demo User',
    })
  })

  it('has a detail fixture for every demo workout card', () => {
    for (const workout of demoWorkoutTemplates) {
      expect(demoWorkoutDetails[String(workout.workoutId)]).toBeDefined()
    }
  })
})
