import { type ReactNode } from 'react'
import { AppContextProvider } from '@/src/contexts/appStateContext'

export default function NextAppProviders({ children }: { children: ReactNode }) {
    return <AppContextProvider>{children}</AppContextProvider>
}
