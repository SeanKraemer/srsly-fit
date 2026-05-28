import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// here we configure a 'common' auth.js object to be used everywhere,
// this will NOT include the database adapter bc we must comply with
// edge runtime rules!
const edgeAuthConfigObject = {
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
        }),
    ],
} satisfies NextAuthConfig

export default edgeAuthConfigObject
