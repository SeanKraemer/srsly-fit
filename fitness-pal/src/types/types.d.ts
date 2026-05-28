export interface CoreAppState {
    UserFirstName?: string
    UserLastName?: string
    UserID?: string
    UserWorkouts: Workout[]
}

export interface CoreAppActions {
    payload?: string
    type: 
    | 'changeFirstName' 
    | 'changeLastName' 
    | 'changeUserID' 
    | 'changeWorkout'
}
