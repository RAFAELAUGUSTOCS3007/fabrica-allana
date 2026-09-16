import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const expectedToken = await getExpectedSessionToken()

  if (!sessionCookie || sessionCookie !== expectedToken) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
