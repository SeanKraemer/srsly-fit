import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import NextAuth from 'next-auth'

// import database adapters we weren't allowed to in edge runtimes
import { createConnection } from 'mysql2/promise'
import { env } from '@/src/env'

// here we configure a seperate auth.js object with does import a
// database adapter, this one will NOT be used in middleware, thus
// we don't violate edge runtime rules!
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
        let conn = undefined

        const nakedUsernameString = credentials.username
        const nakedPasswordString = credentials.password

        try {
          conn = await createConnection(env.DATABASE_URL)
          const [rows, _] = await conn.execute<any[]>(
            `select firstName, lastName, userId, password
                        from Users where username = ?`,
            [nakedUsernameString],
          )

          // check if username is correct
          if (rows.length == 0) return null

          // if username is correct next check password
          const user = rows[0]
          if (user.password != nakedPasswordString) return null

          // finally if all is good return session object
          return {
            id: user.userId,
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
