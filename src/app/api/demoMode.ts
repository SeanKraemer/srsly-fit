import { NextResponse } from 'next/server'

export function demoReadOnlyResponse(action: string) {
  return NextResponse.json(
    { message: `Demo mode is read-only. Switch APP_MODE to live and configure MySQL to ${action}.` },
    { status: 403 },
  )
}
