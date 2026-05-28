import { type ReactNode } from 'react'
import { AppContextProvider } from '@/src/contexts/appStateContext'

// if you have 2,3,4,5 or more providers for various state things in your app,
// you would import them all here and just nest them all.
export default function NextAppProviders({ children }: { children: ReactNode }) {
    return <AppContextProvider>{children}</AppContextProvider>
}
