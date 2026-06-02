'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <button className='px-4 font-bold ml-auto hover:cursor-pointer hover:underline' onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
