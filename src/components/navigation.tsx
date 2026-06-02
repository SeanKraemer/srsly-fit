import SmartPrefetchLink from "./smartPrefetchLink"
import SignOutButton from "./signOutButton"

import { auth } from "../utils/auth"

export default async function Navigation() {
    const session = await auth()

    return (
        <nav className='h-10 flex flex-row rounded items-center'>
            <SmartPrefetchLink href='/dashboard' />
            <SmartPrefetchLink href='/exercises' />
            <SmartPrefetchLink href='/workouts' />
            {!session && <SmartPrefetchLink href='/login' className='ml-auto' />}
            {session && <SignOutButton />}
        </nav>
    )
}
