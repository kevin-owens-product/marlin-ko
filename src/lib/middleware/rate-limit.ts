/**
 * In-memory Sliding Window Rate Limiter
 *
 * Provides per-route, per-client rate limiting using an in-memory sliding
 * window counter. Supports both IP-based and (optional) user-based limiting.
 *
 * In production, replace the in-memory Map store with Redis for
 * multi-instance deployments.
 *
 * Usage:
 *   export const POST = withRateLimit(handler, {
 *     windowMs: 60_000,   // 1 minute
 *     maxRequests: 5,      // 5 requests per window
 *   });
 *
 * Or use the factory for composable middleware:
 *   const limiter = rateLimit({ windowMs: 60_000, max: 10 });
 *   const result = limiter(request);
 *   if (!result.success) { return 429 response }
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, type ApiResponse } from '@/lib/api/response';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Sliding window duration in milliseconds. Default: 60_000 (60 seconds). */
  windowMs?: number;
  /** Maximum number of requests allowed per window. Default: 100. */
  maxRequests?: number;
  /** Alias for maxRequests (for convenient shorthand). */
  max?: number;
  /** Optional key prefix (e.g. route name) for scoping limits. */
  keyPrefix?: string;
  /** If true, also limit per authenticated userId (read from `req.auth`). */
  perUser?: boolean;
  /** Custom message returned in the 429 body. */
  message?: string;
}

interface WindowEntry {
  /** Timestamps of requests within the current window. */
  timestamps: number[];
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfterSeconds: number;
}

// ---------------------------------------------------------------------------
// Preset configurations
// ---------------------------------------------------------------------------

/** Default API rate limit: 100 requests per 60 seconds. */
export const API_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'api',
};

/** Auth endpoint rate limit: 5 requests per minute. */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'auth',
};

/** Strict rate limit for sensitive operations: 10 per 5 minutes. */
export const STRICT_RATE_LIMIT: RateLimitOptions = {
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'strict',
};

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const store = new Map<string, WindowEntry>();

/** Cleanup interval (every 5 minutes). */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Periodically purge expired entries from the store to prevent memory leaks.
 */
function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function checkRateLimit(key: string, windowMs: number, maxRequests: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Slide window -- drop expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const currentCount = entry.timestamps.length;
  const remaining = Math.max(0, maxRequests - currentCount);

  // Determine reset time (oldest timestamp + windowMs, or now + windowMs if empty)
  const resetAt =
    entry.timestamps.length > 0
      ? entry.timestamps[0] + windowMs
      : now + windowMs;

  if (currentCount >= maxRequests) {
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
    return { success: false, remaining: 0, limit: maxRequests, resetAt, retryAfterSeconds };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: remaining - 1, // -1 because we just added one
    limit: maxRequests,
    resetAt,
    retryAfterSeconds: 0,
  };
}

// ---------------------------------------------------------------------------
// Client identifier extraction
// ---------------------------------------------------------------------------

function getClientIdentifier(request: NextRequest): string {
  // Prefer X-Forwarded-For (behind a reverse proxy / load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Absolute fallback
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Factory function: rateLimit()
// ---------------------------------------------------------------------------

/**
 * Create a rate limiter function that can be used standalone.
 *
 * Returns a function that takes a NextRequest and returns a RateLimitResult.
 * Does NOT automatically return a 429 response -- the caller decides what to do.
 *
 * ```ts
 * const limiter = rateLimit({ windowMs: 60_000, max: 10 });
 *
 * export async function POST(req: NextRequest) {
 *   const result = limiter(req);
 *   if (!result.success) {
 *     return apiError('Too many requests', 429);
 *   }
 *   // ...
 * }
 * ```
 */
export function rateLimit(
  options?: { windowMs?: number; max?: number; keyPrefix?: string },
): (req: NextRequest) => RateLimitResult {
  const windowMs = options?.windowMs ?? 60_000;
  const maxRequests = options?.max ?? 100;
  const keyPrefix = options?.keyPrefix ?? 'default';

  return (req: NextRequest): RateLimitResult => {
    cleanup(windowMs);

    const clientId = getClientIdentifier(req);

    // Also include userId if available via auth context
    const auth = (req as any).auth;
    const userPart = auth?.userId ? `:user:${auth.userId}` : '';
    const key = `rl:${keyPrefix}:${clientId}${userPart}`;

    return checkRateLimit(key, windowMs, maxRequests);
  };
}

// ---------------------------------------------------------------------------
// Middleware wrapper: withRateLimit()
// ---------------------------------------------------------------------------

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

/**
 * Wrap a route handler with sliding-window rate limiting.
 *
 * ```ts
 * import { withRateLimit, AUTH_RATE_LIMIT } from '@/lib/middleware/rate-limit';
 *
 * export const POST = withRateLimit(handler, AUTH_RATE_LIMIT);
 * ```
 */
export function withRateLimit(handler: RouteHandler, options?: RateLimitOptions) {
  const windowMs = options?.windowMs ?? 60 * 1000;
  const maxRequests = options?.maxRequests ?? options?.max ?? 100;
  const keyPrefix = options?.keyPrefix ?? 'default';
  const perUser = options?.perUser ?? false;
  const message = options?.message ?? 'Too many requests. Please try again later.';

  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    // Periodic cleanup of expired entries
    cleanup(windowMs);

    // Build the rate-limit key
    const clientId = getClientIdentifier(request);
    let key = `rl:${keyPrefix}:${clientId}`;

    // Optionally add user-based scoping
    if (perUser) {
      const auth = (request as any).auth;
      if (auth?.userId) {
        key = `rl:${keyPrefix}:user:${auth.userId}`;
      }
    }

    const result = checkRateLimit(key, windowMs, maxRequests);

    if (!result.success) {
      const response = errorResponse(message, 429) as NextResponse<ApiResponse>;
      response.headers.set('Retry-After', String(result.retryAfterSeconds));
      response.headers.set('X-RateLimit-Limit', String(result.limit));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
      return response;
    }

    // Proceed to handler, then add rate-limit headers to the response
    const response = await handler(request, context);
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    return response;
  };
}

// ---------------------------------------------------------------------------
// Utility: reset store (useful for tests)
// ---------------------------------------------------------------------------

/** @internal -- exported for testing only. */
export function _resetStore(): void {
  store.clear();
}
