import { describe, expect, it } from 'vitest'

import { demoReadOnlyResponse } from './demoMode'

describe('demoReadOnlyResponse', () => {
  it('returns a consistent read-only mutation response', async () => {
    const response = demoReadOnlyResponse('save workouts')
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      message: 'Demo mode is read-only. Switch APP_MODE to live and configure MySQL to save workouts.',
    })
  })
})
