// src/components/WorkoutTracker.tsx
'use client'

import { memo } from 'react';

// Define the props to be accepted from EditableWorkout
interface WorkoutTrackerProps {
  duration: number;
}

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function WorkoutTracker({ duration }: WorkoutTrackerProps) {
  // Use a simple span for displaying the time. This avoids the <div> in <p> hydration error.
  return (
    <span className="tabular-nums font-medium">
      {formatTime(duration)}
    </span>
  );
}

// Use memo to prevent re-rendering if the props haven't changed.
export default memo(WorkoutTracker);