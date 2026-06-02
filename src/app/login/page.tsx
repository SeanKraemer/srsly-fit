import SmartForm from '@/src/components/smartForm'
import { isDemoMode } from '@/src/env'
import { auth } from '@/src/utils/auth'
import { redirect } from 'next/navigation'

export default async function Login() {
  const session = await auth()
  if (session) return redirect('/dashboard')

  return (
    <main className='w-full h-full flex flex-col justify-baseline bg-red-800 rounded'>
      <SmartForm demoMode={isDemoMode} />
    </main>
  )
}
