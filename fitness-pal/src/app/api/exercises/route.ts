// src/app/api/exercises/route.ts  (This is your NEW file)

import { NextResponse } from 'next/server';
import { pool } from '@/src/database/pool'; // Use the correct path with 'src'

// This function will handle GET requests to /api/exercises
export async function GET() {
    try {
        const [rows]: any = await pool.query(
            "SELECT exerciseId, name FROM Exercises"
        );
        
        return NextResponse.json({ exercises: rows }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch exercises:', error);
        
        return NextResponse.json(
            { message: 'Error fetching exercises from the database.' },
            { status: 500 }
        );
    }
}