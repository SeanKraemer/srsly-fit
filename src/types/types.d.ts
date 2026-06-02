export interface UserWorkoutSummary {
    workoutId: number
    name: string
}

export interface CoreAppState {
    UserFirstName?: string
    UserLastName?: string
    UserID?: string
    UserWorkouts: UserWorkoutSummary[]
}

export interface CoreAppActions {
    payload?: string
    type: 
    | 'changeFirstName' 
    | 'changeLastName' 
    | 'changeUserID' 
    | 'changeWorkout'
}
