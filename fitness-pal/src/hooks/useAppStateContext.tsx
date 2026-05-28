'use client'

import { type Dispatch, useReducer } from 'react'
import { CoreAppState, CoreAppActions } from '@/src/types/types'

// Here we setup and return the core application STATE and the functional
// reducer that will DISPATCH a series of setState actions we can use 
// to mutate the client-side user state. This is a custom hook that returns
// a custom objext of types CoreAppState and a Dispatch of type CoreAppActions.
export function useAppReducer(): [CoreAppState, Dispatch<CoreAppActions>] {
    const initialState: CoreAppState = {
        UserFirstName: '',
        UserLastName: '',
        UserID: '',
        UserWorkouts: [],
    }
    const [state, dispatch] = useReducer(reducer, initialState)

    return [state, dispatch]
}

// the functional reducer that returns the appropriate setState action given a type of action.
function reducer(state: CoreAppState, action: CoreAppActions): CoreAppState {
    switch (action.type) {
        case 'changeFirstName':
            return handleFirstNameChange(state, action)

        case 'changeLastName':
            return handleLastNameChange(state, action)

        case 'changeUserID':
            return handleIdChange(state, action)

        case 'changeWorkout':
            return handleWorkoutChange(state, action)
        default: {
            return { ...state }
        }
    }
}

// basically a function to correspond to every potential action type, they're all very similar.
function handleFirstNameChange(state: CoreAppState, action: CoreAppActions): CoreAppState {
    if (action.payload == undefined) {
        return { ...state }
    }

    const newFirstName = action.payload
    return { ...state, UserFirstName: newFirstName }
}

function handleLastNameChange(state: CoreAppState, action: CoreAppActions): CoreAppState {
    if (action.payload == undefined) {
        return { ...state }
    }

    const newLastName = action.payload
    return { ...state, UserLastName: newLastName }
}

function handleIdChange(state: CoreAppState, action: CoreAppActions): CoreAppState {
    if (action.payload == undefined) {
        return { ...state }
    }

    const newUserID = action.payload
    return { ...state, UserID: newUserID }
}

function handleWorkoutChange(state: CoreAppState, action: CoreAppActions): CoreAppState {
    if (action.payload == undefined) {
        return { ...state }
    }

    // TODO: we need to handle workout updates etc.

    return { ...state }
}
