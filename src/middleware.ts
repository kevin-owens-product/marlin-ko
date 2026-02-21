/**
 * Next.js Edge Middleware -- Route Protection & Security Headers
 *
 * Runs on every request at the edge. Handles:
 *   1. Public route allowlist (login, auth API, health, static assets)
 *   2. JWT session validation from the `medius_session` cookie
 *   3. Role-based route restrictions (admin, supplier portal)
 *   4. Security headers on every response
 *   5. API routes return 401 JSON; page routes redirect to /login
 */

import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET_ENV = 'MEDIUS_JWT_SECRET';
const DEFAULT_SECRET = 'medius-dev-secret-change-in-production-32chars!';
const SESSION_COOKIE = 'medius_session';
const ISSUER = 'medius-platform';
const AUDIENCE = 'medius-api';

function getSecretKey(): Uint8Array {
  const secret = process.env[JWT_SECRET_ENV] || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/** Routes that never require authentication. */
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth',      // all sub-paths: /api/auth/login, /api/auth/register, etc.
  '/api/health',
  '/supplier-portal/auth',
  '/_next',
  '/favicon.ico',
];

/** Check whether a pathname is public (no auth required). */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Check if path is a static file extension. */
function isStaticAsset(pathname: string): boolean {
  return /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|map)$/i.test(pathname);
}

// ---------------------------------------------------------------------------
// JWT payload type (mirrors auth middleware)
// ---------------------------------------------------------------------------

interface TokenClaims {
  sub: string;
  role: string;
  tenantId: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes and static assets
  if (isPublicPath(pathname) || isStaticAsset(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // 2. Read JWT from session cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return handleUnauthenticated(request);
  }

  // 3. Verify token
  let claims: TokenClaims;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    claims = payload as unknown as TokenClaims;
  } catch {
    // Token invalid or expired -- clear cookie and redirect to login
    const response = redirectToLogin(request);
    response.cookies.delete(SESSION_COOKIE);
    return addSecurityHeaders(response);
  }

  // 4. Role-based route restrictions
  // Admin routes: only ADMIN role
  if (pathname.startsWith('/admin')) {
    if (claims.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/', request.url)),
      );
    }
  }

  // Supplier portal routes: only SUPPLIER token type or ADMIN
  if (pathname.startsWith('/supplier-portal')) {
    if (claims.type !== 'supplier' && claims.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/', request.url)),
      );
    }
  }

  // 5. Attach user info as request headers (accessible in server components / route handlers)
  const response = NextResponse.next();
  response.headers.set('x-user-id', claims.sub);
  response.headers.set('x-user-role', claims.role);
  response.headers.set('x-tenant-id', claims.tenantId);

  return addSecurityHeaders(response);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Handle unauthenticated requests.
 * - API routes receive a 401 JSON response
 * - Page routes are redirected to /login with a callbackUrl
 */
function handleUnauthenticated(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // API routes return 401 JSON
  if (pathname.startsWith('/api/')) {
    return addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      ),
    );
  }

  // Page routes redirect to login
  return addSecurityHeaders(redirectToLogin(request));
}

/**
 * Build a redirect response to the login page, preserving the original
 * destination as a callbackUrl query parameter.
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  // Preserve the intended destination so the login page can redirect back
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/login') {
    loginUrl.searchParams.set('callbackUrl', pathname + search);
  }
  return NextResponse.redirect(loginUrl);
}

/**
 * Append security headers to every response.
 *
 * Headers applied:
 * - X-Content-Type-Options: nosniff (prevent MIME-type sniffing)
 * - X-Frame-Options: DENY (prevent clickjacking)
 * - X-XSS-Protection: 1; mode=block (legacy XSS filter)
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: restrict camera, mic, geolocation
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  return response;
}

// ---------------------------------------------------------------------------
// Matcher configuration
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     *
     * The middleware itself performs more granular checks for public routes.
     */
    '/((?!_next/static|_next/image).*)',
  ],
};
