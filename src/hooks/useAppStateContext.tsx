'use client'

import { type Dispatch, useReducer } from 'react'
import { CoreAppState, CoreAppActions } from '@/src/types/types'

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

    return { ...state }
}
