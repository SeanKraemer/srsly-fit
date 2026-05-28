'use client'

import { Dispatch, createContext } from 'react'
import { CoreAppState, CoreAppActions } from '@/src/types/types'
import { useAppReducer } from '@/src/hooks/useAppStateContext'

// here we create 2 context objects, one for the state and one for the dispatch.
export const AppStateContext = createContext<CoreAppState | undefined>(undefined)
export const AppStateDispatchContext = createContext<Dispatch<CoreAppActions> | undefined>(undefined)

// a provider will provide BOTH state, and the actions to mutate that state on the client side.
export function AppContextProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useAppReducer() // custom hook from hooks folder.

    // 'children' refers to the parts of the website that our context provider 
    // 'wraps' (provides service to).
    return (
        <AppStateContext.Provider value={state}>
            <AppStateDispatchContext.Provider value={dispatch}>
                {children}
            </AppStateDispatchContext.Provider>
        </AppStateContext.Provider>
    )
}
