import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import NextAuth from 'next-auth'

import { createConnection, type RowDataPacket } from 'mysql2/promise'
import { env, isDemoMode } from '@/src/env'
import { demoUser } from '@/src/data/demoData'

interface UserAuthRow extends RowDataPacket {
  firstName: string
  lastName: string | null
  userId: number
  password: string
}

const nonEdgeAuthConfigObject = {
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, the `user` object is available.
      // We add its ID to the token.
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.id);
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: {
          type: 'text',
          label: 'username',
          placeholder: 'username',
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: '*****',
        },
      },
      authorize: async (credentials) => {
        const username = String(credentials.username ?? '')
        const password = String(credentials.password ?? '')

        if (isDemoMode) {
          if (username === demoUser.username && password === demoUser.password) {
            return {
              id: demoUser.id,
              name: demoUser.name,
            }
          }

          return null
        }

        let conn = undefined

        try {
          conn = await createConnection(env.DATABASE_URL!)
          const [rows] = await conn.execute<UserAuthRow[]>(
            `select firstName, lastName, userId, password
                        from Users where username = ?`,
            [username],
          )

          // check if username is correct
          if (rows.length == 0) return null

          // if username is correct next check password
          const user = rows[0]
          if (user.password != password) return null

          // finally if all is good return session object
          return {
            id: String(user.userId),
            name: `${user.firstName} ${user.lastName}`,
          }
        } catch (error) {
            console.log(`AUTHORIZE ERROR: ${error}`)
            throw error
        } finally {
          if (conn) await conn.end()
        }
      },
    }),
  ],
} satisfies NextAuthConfig

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth(nonEdgeAuthConfigObject)
