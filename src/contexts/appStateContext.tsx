'use client'

import { Dispatch, createContext } from 'react'
import { CoreAppState, CoreAppActions } from '@/src/types/types'
import { useAppReducer } from '@/src/hooks/useAppStateContext'

export const AppStateContext = createContext<CoreAppState | undefined>(undefined)
export const AppStateDispatchContext = createContext<Dispatch<CoreAppActions> | undefined>(undefined)

export function AppContextProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useAppReducer()

    return (
        <AppStateContext.Provider value={state}>
            <AppStateDispatchContext.Provider value={dispatch}>
                {children}
            </AppStateDispatchContext.Provider>
        </AppStateContext.Provider>
    )
}
