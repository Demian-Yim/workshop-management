import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection: redirect to login if auth cookie absent.
  // Full Firebase ID-token verification requires Firebase Admin SDK which
  // cannot run in Edge Runtime; client-side validation in DashboardLayout
  // performs the authoritative check. This middleware provides a first-pass
  // redirect to avoid a flash of the protected UI for unauthenticated users.
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Facilitator /create route: require auth cookie before session creation.
  // Prevents anonymous session spam while keeping the Edge-compatible check.
  if (pathname === '/create') {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /present and /session routes: session context validated client-side via
  // SessionProvider (Zustand store in localStorage is not accessible here).

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/create', '/present/:path*', '/session/:path*'],
};
