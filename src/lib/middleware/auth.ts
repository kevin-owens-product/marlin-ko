/**
 * API Route Authentication Middleware
 *
 * Provides JWT-based authentication and role-based authorization for
 * Next.js App Router route handlers. Uses the `jose` library for
 * edge-compatible JWT operations and Web Crypto API for password hashing.
 *
 * Usage:
 *   export const GET = withAuth(handler);
 *   export const POST = withAuth(handler, { roles: ['ADMIN', 'APPROVER'] });
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import {
  errorResponse,
  type ApiResponse,
} from '@/lib/api/response';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JWT_SECRET_ENV = 'MEDIUS_JWT_SECRET';
const DEFAULT_SECRET = 'medius-dev-secret-change-in-production-32chars!';
const SESSION_COOKIE = 'medius_session';
const CSRF_COOKIE = 'medius_csrf';
const CSRF_HEADER = 'x-csrf-token';
const ISSUER = 'medius-platform';
const AUDIENCE = 'medius-api';

/** 24 hours */
const SESSION_EXPIRY = '24h';
/** 7 days */
const REMEMBER_ME_EXPIRY = '7d';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'ADMIN' | 'APPROVER' | 'AP_CLERK' | 'VIEWER' | 'SUPPLIER';

/** Role hierarchy used for permission comparison. Higher = more privileged. */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  APPROVER: 3,
  AP_CLERK: 2,
  VIEWER: 1,
  SUPPLIER: 0,
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

export interface TokenPayload extends JWTPayload {
  sub: string; // userId
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  type: 'session' | 'supplier';
}

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    tokenType: 'session' | 'supplier';
  };
}

export interface AuthOptions {
  /** Restrict to specific roles. If omitted any authenticated user may proceed. */
  roles?: UserRole[];
  /** Skip CSRF check (e.g. for GET / HEAD / OPTIONS). Default false. */
  skipCsrf?: boolean;
}

type RouteHandler = (
  request: AuthenticatedRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse<ApiResponse>>;

// ---------------------------------------------------------------------------
// Helpers -- secret
// ---------------------------------------------------------------------------

/** JWT secret used for signing and verification. Reads from environment with dev fallback. */
export const JWT_SECRET = process.env[JWT_SECRET_ENV] || DEFAULT_SECRET;

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

// ---------------------------------------------------------------------------
// Token creation & verification
// ---------------------------------------------------------------------------

/**
 * Create a signed JWT for the given payload.
 *
 * @param payload - Token claims excluding standard JWT fields (iss, aud, iat, exp)
 * @param rememberMe - If true, token expires in 7 days; otherwise 24 hours
 * @returns Signed JWT string
 */
export async function signToken(
  payload: Omit<TokenPayload, 'iss' | 'aud' | 'iat' | 'exp'>,
  rememberMe = false,
): Promise<string> {
  const expiry = rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(expiry)
    .sign(getSecretKey());
}

/** Alias for backward compatibility */
export const createToken = signToken;

/**
 * Verify and decode a JWT. Returns the typed payload or null on failure.
 *
 * @param token - Raw JWT string
 * @returns Decoded token payload, or null if invalid/expired
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify a session by extracting and verifying the JWT from the request.
 * Returns the decoded payload or null if the session is invalid.
 *
 * @param req - Incoming Next.js request
 * @returns Decoded token payload, or null
 */
export async function verifySession(req: NextRequest): Promise<TokenPayload | null> {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Extract the authenticated user from a request.
 * Returns an AuthUser object or null if not authenticated.
 *
 * @param req - Incoming Next.js request
 * @returns AuthUser with id, email, name, role, tenantId, or null
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const payload = await verifySession(req);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    tenantId: payload.tenantId,
  };
}

// ---------------------------------------------------------------------------
// Password hashing (Web Crypto API -- edge-compatible, no bcrypt)
// ---------------------------------------------------------------------------

/**
 * Hash a password using PBKDF2 with a random salt.
 * Returns `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  const hashHex = bufferToHex(new Uint8Array(derivedBits));
  const saltHex = bufferToHex(salt);
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored `salt:hash` string.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, expectedHashHex] = storedHash.split(':');
  if (!saltHex || !expectedHashHex) return false;

  const salt = hexToBuffer(saltHex) as BufferSource;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  const computedHex = bufferToHex(new Uint8Array(derivedBits));
  return timingSafeEqual(computedHex, expectedHashHex);
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

/**
 * Check if a user's role meets the minimum required role level.
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ---------------------------------------------------------------------------
// CSRF helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random CSRF token (hex string).
 */
export function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bufferToHex(bytes);
}

/**
 * Validate double-submit cookie pattern: the cookie value must match
 * the value sent in the request header.
 */
function validateCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}

// ---------------------------------------------------------------------------
// Middleware wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap a route handler with JWT authentication and optional role checks.
 *
 * The handler receives an `AuthenticatedRequest` with an `auth` property
 * containing the decoded user information.
 *
 * ```ts
 * export const GET = withAuth(async (req) => {
 *   const { userId, tenantId } = req.auth;
 *   // ...
 * });
 *
 * export const POST = withAuth(
 *   async (req) => { ... },
 *   { roles: ['ADMIN'] },
 * );
 * ```
 */
export function withAuth(handler: RouteHandler, options?: AuthOptions) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    // 1. Extract token from cookie or Authorization header
    const token = extractToken(request);
    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    // 2. Verify JWT
    const payload = await verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    // 3. CSRF validation for state-changing methods
    const method = request.method.toUpperCase();
    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (mutating && !options?.skipCsrf) {
      if (!validateCsrf(request)) {
        return errorResponse('Invalid CSRF token', 403);
      }
    }

    // 4. Role-based authorization
    if (options?.roles && options.roles.length > 0) {
      if (!options.roles.includes(payload.role)) {
        return errorResponse('Insufficient permissions', 403);
      }
    }

    // 5. Attach auth context to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.auth = {
      userId: payload.sub!,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tenantId: payload.tenantId,
      tokenType: payload.type,
    };

    return handler(authenticatedRequest, context);
  };
}

// ---------------------------------------------------------------------------
// Token extraction
// ---------------------------------------------------------------------------

/**
 * Extract JWT token from the request, checking cookie first then
 * the Authorization header.
 */
function extractToken(request: NextRequest): string | null {
  // Try cookie first (medius_session)
  const cookieToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  // Try Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Utility: hex encode/decode
// ---------------------------------------------------------------------------

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
