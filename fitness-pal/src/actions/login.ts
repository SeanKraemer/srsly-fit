'use server'

import { signIn } from '@/src/utils/auth'

import { createConnection } from 'mysql2/promise'
import { env } from '@/src/env'

export async function loginAction(formData: FormData) {
  const data: Record<string, string> = {}
  formData.forEach((val, key) => {
    data[key] = val.toString()
  })

  await signIn('credentials', { ...data, redirectTo: '/dashboard' })
}

export async function signUpAction(formData: FormData) {
  let conn = undefined
  let errorCode = undefined

  const new_username = formData.get('username')
  const new_password = formData.get('password')
  const new_first = formData.get('firstname')
  const new_last = formData.get('lastname')

  try {
    conn = await createConnection(env.DATABASE_URL)
    const [res] = await conn.execute<any[]>('CALL SignUpUser(?, ?, ?, ?)', [
      new_username,
      new_password,
      new_first,
      new_last,
    ])

    errorCode = res[0][0].success
    if (errorCode) {
      throw new Error('Username already exists!')
    }
  } catch (error) {
    console.log(error)
  } finally {
    if (conn) await conn.end()
    if (!errorCode) await loginAction(formData)
  }
}
