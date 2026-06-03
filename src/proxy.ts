import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionFromToken } from '@/lib/auth'

// In paths ko middleware security se bypass (skip) karna hai
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/cron']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Check karein agar request cron alerts ki taraf ja rahi hai ya public path hai
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next() // Bina authentication check ke direct aage jaane dein
  }

  const token = request.cookies.get('session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await verifySessionFromToken(token)

    if (pathname.startsWith('/dashboard/users') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Config matchers array ko update kiya gaya hai
export const config = {
  /*
   * Humne direct '/api/cron/:path*' ko list se delete kar diya hai,
   * aur regex matcher ke andar (?!api/cron) add kar diya hai taake yeh bypass ho jaye.
   */
  matcher: [
    '/dashboard/:path*', 
    '/api/jobs/:path*', 
    '/api/users/:path*', 
    '/((?!api/cron|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
}