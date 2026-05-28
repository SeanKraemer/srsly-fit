// src/database/pool.ts

import mysql from 'mysql2/promise';

// Best practice: Check that the environment variable is actually set.
// This will cause the server to fail on startup if the URL is missing,
// which is better than failing on a user request.
if (!process.env.DATABASE_URL) {
    throw new Error("FATAL ERROR: DATABASE_URL is not defined in your .env.local file");
}

// The mysql2 pool can be created directly from the connection string.
export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL, // This reads the URL from your .env.local file
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('Database connection pool created successfully.');