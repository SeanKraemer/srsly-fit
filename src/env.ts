import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const optionalString = z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().optional(),
)

export const env = createEnv({
    server: {
        APP_MODE: z.enum(['demo', 'live']).default('demo'),
        AUTH_SECRET: z.string().min(1),
        AUTH_TRUST_HOST: optionalString,
        DATABASE_URL: z.preprocess(
            (value) => value === '' ? undefined : value,
            z.string().url().optional(),
        ),
        YOUTUBE_API_KEY: optionalString,
    },
    runtimeEnv: {
        APP_MODE: process.env.APP_MODE,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
        DATABASE_URL: process.env.DATABASE_URL,
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    },
})

if (env.APP_MODE === 'live' && !env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when APP_MODE=live')
}

export const isDemoMode = env.APP_MODE === 'demo'
