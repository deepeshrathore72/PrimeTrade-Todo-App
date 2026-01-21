import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of paths that require authentication
const protectedPaths = ['/dashboard'];

// List of paths that should redirect to dashboard if already authenticated
const authPaths = ['/auth/login', '/auth/register'];

// API paths that need rate limiting
const apiPaths = ['/api'];

// Security headers to add to all responses
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to response
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get the secret (NextAuth v5 uses AUTH_SECRET, v4 uses NEXTAUTH_SECRET)
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  // Check for NextAuth session token
  const token = await getToken({
    req: request,
    secret: secret,
  });

  // Also check for legacy JWT token in cookies
  const legacyToken = request.cookies.get('token')?.value;

  const isAuthenticated = !!(token || legacyToken);

  // Check if the current path is a protected path
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the current path is an auth path
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // If trying to access protected route without authentication, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth route while authenticated, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
