'use server'

import { signIn } from '@/src/utils/auth'

import { createConnection } from 'mysql2/promise'
import { env, isDemoMode } from '@/src/env'

export async function loginAction(formData: FormData) {
  const data: Record<string, string> = {}
  formData.forEach((val, key) => {
    data[key] = val.toString()
  })

  await signIn('credentials', { ...data, redirectTo: '/dashboard' })
}

export async function signUpAction(formData: FormData) {
  if (isDemoMode) {
    return
  }

  let conn = undefined
  let errorCode = undefined

  const new_username = formData.get('username')
  const new_password = formData.get('password')
  const new_first = formData.get('firstname')
  const new_last = formData.get('lastname')

  try {
    conn = await createConnection(env.DATABASE_URL!)
    await conn.execute('INSERT INTO Users (username, password, firstName, lastName) VALUES (?, ?, ?, ?)', [
      new_username,
      new_password,
      new_first,
      new_last,
    ])
  } catch (error) {
    console.log(error)
    errorCode = true
  } finally {
    if (conn) await conn.end()
    if (!errorCode) await loginAction(formData)
  }
}
