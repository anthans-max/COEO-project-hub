// middleware.ts
// HTTP Basic Auth for the Coeo Project Hub.
// Credentials come from environment variables set in Vercel.
//
// Placement: this project uses the src/ directory, so middleware
// must live at src/middleware.ts for Next.js to detect it.

import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  // Match all paths except Next.js internals, static assets, and favicon.
  // Supabase auth callbacks (if you add auth later) would need an exception here too.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
  ],
};

export default function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const expectedUser = process.env.BASIC_AUTH_USER;
    const expectedPwd = process.env.BASIC_AUTH_PASSWORD;

    if (user === expectedUser && pwd === expectedPwd) {
      // Auth OK — let the request through
      return NextResponse.next();
    }
  }

  // No auth or bad auth — prompt for credentials
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Coeo Project Hub"',
    },
  });
}
