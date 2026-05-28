'use client'

import { useRouter } from 'next/navigation'

export default function CreateWorkoutButton() {
  const router = useRouter()

  // Create a new WorkoutTemplate and navigate the user to the new empty page
  const createAndNavigate = async() => {
    console.log('CreateWorkoutButton clicked');
    const res = await fetch('/api/createEmptyWorkout', {
      method: 'POST'
    })

    const { workoutId } = await res.json()
    console.log('CreateWorkoutButton', workoutId);
    router.push(`/workouts/${workoutId}`)
  }

  return (
    <button
      onClick={createAndNavigate}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
    >
      Start An Empty Workout
    </button>
  )
}