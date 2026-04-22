import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET
if (!secretKey || secretKey.length < 32) {
  throw new Error('SESSION_SECRET muss mindestens 32 Zeichen lang sein und in der Umgebung gesetzt sein.')
}
const encodedKey = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
  const protectedPaths = [
    '/api/update_user',
    '/api/update_book',
    '/api/delete_book',
    '/api/fetch_purchase_options',
  ]
  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    const session = request.cookies.get('session')?.value

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await jwtVerify(session, encodedKey, { algorithms: ['HS256'] })
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/update_user',
    '/api/update_book',
    '/api/delete_book',
    '/api/fetch_purchase_options',
  ],
}
