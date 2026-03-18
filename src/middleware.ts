import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection: check for auth cookie/token
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('auth-token')?.value;

    // In production, verify the Firebase ID token server-side
    // For now, the auth guard is handled client-side in the dashboard layout
    // This middleware can be enhanced with Firebase Admin SDK verification
  }

  // Facilitator routes: ensure session context exists
  if (pathname.startsWith('/present')) {
    // Session validation handled client-side via SessionProvider
  }

  // Learner routes: ensure session is joined
  if (pathname.startsWith('/session')) {
    // Session validation handled client-side via SessionProvider
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/present/:path*', '/session/:path*'],
};
