import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

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
