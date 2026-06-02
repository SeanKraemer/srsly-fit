import mysql from 'mysql2/promise'
import { env } from '@/src/env'

let pool: mysql.Pool | undefined

export function getPool() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for live database access')
  }

  pool ??= mysql.createPool({
    uri: env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  return pool
}
