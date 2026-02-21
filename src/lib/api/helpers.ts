/**
 * Composable API Helpers
 *
 * Provides `pipe()` for composing multiple middleware wrappers, and
 * utility wrappers for auth, validation, tenant scoping, pagination,
 * rate limiting, and audit logging.
 *
 * Usage:
 *   import { pipe } from '@/lib/api/helpers';
 *   import { withAuth } from '@/lib/middleware/auth';
 *   import { withRateLimit, API_RATE_LIMIT } from '@/lib/middleware/rate-limit';
 *   import { withValidation } from '@/lib/middleware/validation';
 *
 *   export const POST = pipe(
 *     (h) => withRateLimit(h, API_RATE_LIMIT),
 *     (h) => withAuth(h, { roles: ['ADMIN'] }),
 *     (h) => withValidation(CreateInvoiceSchema, h),
 *   )(async (req) => {
 *     // req.auth, req.validatedData are available
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  type ApiResponse,
  type PaginationMeta,
} from '@/lib/api/response';
import type { AuthenticatedRequest, UserRole } from '@/lib/middleware/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnyHandler = (
  request: any,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

type Middleware = (handler: AnyHandler) => AnyHandler;

// Re-export RouteHandler type for external consumers
export type RouteHandler = AnyHandler;

// ---------------------------------------------------------------------------
// pipe() / compose() -- compose middleware
// ---------------------------------------------------------------------------

/**
 * Compose multiple middleware wrappers into a single pipeline.
 * Middlewares are applied right-to-left (innermost first), meaning the
 * first middleware in the list is the outermost wrapper (runs first on
 * the incoming request).
 *
 * ```ts
 * export const POST = pipe(
 *   (h) => withRateLimit(h, API_RATE_LIMIT),  // runs first
 *   (h) => withAuth(h, { roles: ['ADMIN'] }), // runs second
 * )(handler);                                  // innermost
 * ```
 */
export function pipe(...middlewares: Middleware[]) {
  return (handler: AnyHandler): AnyHandler => {
    // Apply from right to left so that the first middleware listed is outermost
    return middlewares.reduceRight(
      (next, mw) => mw(next),
      handler,
    );
  };
}

/**
 * Alias for pipe(). Compose multiple middleware into a single wrapper.
 * Both names are provided for stylistic preference.
 */
export const compose = pipe;

// ---------------------------------------------------------------------------
// withTenant -- auto-scope queries by tenantId
// ---------------------------------------------------------------------------

export interface TenantScopedRequest extends AuthenticatedRequest {
  tenantId: string;
}

type TenantHandler = (
  request: TenantScopedRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

/**
 * Automatically injects the authenticated user's `tenantId` onto the request
 * and provides a convenient `request.tenantId` accessor.
 *
 * Must be used after `withAuth`.
 */
export function withTenant(handler: TenantHandler): AnyHandler {
  return async (request: any, context) => {
    const auth = request.auth;
    if (!auth?.tenantId) {
      return errorResponse('Tenant context required', 403);
    }

    const tenantRequest = request as TenantScopedRequest;
    tenantRequest.tenantId = auth.tenantId;

    return handler(tenantRequest, context);
  };
}

// ---------------------------------------------------------------------------
// withPagination -- parse & validate pagination params
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  offset: number;
}

export interface PaginatedRequest extends NextRequest {
  pagination: PaginationParams;
}

export interface PaginationOptions {
  /** Default sort field. Default: 'createdAt'. */
  defaultSortBy?: string;
  /** Default sort direction. Default: 'desc'. */
  defaultSortOrder?: 'asc' | 'desc';
  /** Maximum allowed limit. Default: 100. */
  maxLimit?: number;
  /** Default page size. Default: 20. */
  defaultLimit?: number;
  /** Allowed sort fields. If provided, rejects unknown fields. */
  allowedSortFields?: string[];
}

type PaginatedHandler = (
  request: PaginatedRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

/**
 * Parse standard pagination query parameters (page, limit, sortBy, sortOrder)
 * and attach them as `request.pagination`.
 *
 * ```ts
 * export const GET = withPagination(async (req) => {
 *   const { page, limit, offset, sortBy, sortOrder } = req.pagination;
 *   // Use these to query your database
 * }, { defaultSortBy: 'createdAt', maxLimit: 50 });
 * ```
 */
export function withPagination(handler: PaginatedHandler, options?: PaginationOptions): AnyHandler {
  const defaultSortBy = options?.defaultSortBy ?? 'createdAt';
  const defaultSortOrder = options?.defaultSortOrder ?? 'desc';
  const maxLimit = options?.maxLimit ?? 100;
  const defaultLimit = options?.defaultLimit ?? 20;
  const allowedSortFields = options?.allowedSortFields;

  return async (request: NextRequest, context) => {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10)));
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' as const : defaultSortOrder;
    let sortBy = searchParams.get('sortBy') || defaultSortBy;

    // Validate sort field if allowlist is provided
    if (allowedSortFields && !allowedSortFields.includes(sortBy)) {
      sortBy = defaultSortBy;
    }

    const offset = (page - 1) * limit;

    const paginatedRequest = request as PaginatedRequest;
    paginatedRequest.pagination = { page, limit, sortBy, sortOrder, offset };

    return handler(paginatedRequest, context);
  };
}

/**
 * Build a PaginationMeta object from pagination params and a total count.
 * Useful inside route handlers that use withPagination.
 */
export function buildPaginationMeta(
  params: PaginationParams,
  totalCount: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / params.limit);
  return {
    page: params.page,
    limit: params.limit,
    totalCount,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrevious: params.page > 1,
  };
}

// ---------------------------------------------------------------------------
// withAudit -- auto-log mutations to audit trail
// ---------------------------------------------------------------------------

export type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'APPROVED' | 'REJECTED' | 'LOGIN' | 'EXPORT' | 'CONFIGURED';

export interface AuditOptions {
  /** The type of entity being operated on (e.g. 'Invoice', 'User'). */
  entityType: string;
  /**
   * How to determine the action from the HTTP method.
   * Defaults: POST->CREATED, PUT/PATCH->UPDATED, DELETE->DELETED.
   * Can be overridden with a static action.
   */
  action?: AuditAction;
  /**
   * Extract the entity ID from the response body.
   * Default: looks for `data.id` in the response JSON.
   */
  extractEntityId?: (responseBody: any) => string;
}

/**
 * Wrap a handler to automatically write an audit log entry after a
 * successful mutation (2xx response for POST, PUT, PATCH, DELETE).
 *
 * Must be used after `withAuth` so that `req.auth` is available.
 *
 * The audit entry is written via the Prisma client. Import is deferred
 * to avoid circular dependency issues and to keep this module
 * edge-compatible for import (the actual write only runs in Node).
 */
export function withAudit(handler: AnyHandler, auditOptions: AuditOptions): AnyHandler;
export function withAudit(handler: AnyHandler, entityType: string): AnyHandler;
export function withAudit(handler: AnyHandler, auditOptionsOrEntityType: AuditOptions | string): AnyHandler {
  const auditOptions: AuditOptions = typeof auditOptionsOrEntityType === 'string'
    ? { entityType: auditOptionsOrEntityType }
    : auditOptionsOrEntityType;

  return async (request: any, context) => {
    const response = await handler(request, context);

    // Only audit successful mutations
    const status = response.status;
    if (status < 200 || status >= 300) {
      return response;
    }

    const method = request.method?.toUpperCase();
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutation) {
      return response;
    }

    // Determine action
    const action: AuditAction =
      auditOptions.action ??
      methodToAction(method);

    // Attempt to extract entity ID from response
    let entityId = 'unknown';
    try {
      // Clone the response to read the body without consuming it
      const cloned = response.clone();
      const body = await cloned.json();
      if (auditOptions.extractEntityId) {
        entityId = auditOptions.extractEntityId(body);
      } else if (body?.data?.id) {
        entityId = body.data.id;
      }
    } catch {
      // Could not parse response -- keep entityId as 'unknown'
    }

    // Write audit log asynchronously (fire-and-forget)
    const auth = request.auth;
    if (auth) {
      writeAuditLog({
        tenantId: auth.tenantId,
        userId: auth.userId,
        action,
        entityType: auditOptions.entityType,
        entityId,
        ipAddress: getClientIp(request),
        details: JSON.stringify({
          method,
          path: request.nextUrl?.pathname,
        }),
      }).catch((err) => {
        console.error('[Audit] Failed to write audit log:', err);
      });
    }

    return response;
  };
}

function methodToAction(method: string): AuditAction {
  switch (method) {
    case 'POST':
      return 'CREATED';
    case 'PUT':
    case 'PATCH':
      return 'UPDATED';
    case 'DELETE':
      return 'DELETED';
    default:
      return 'UPDATED';
  }
}

function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null
  );
}

async function writeAuditLog(entry: {
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  details: string | null;
}): Promise<void> {
  try {
    // Dynamic import to avoid bundling prisma in edge contexts
    const { prisma } = await import('@/lib/db');
    await prisma.auditLog.create({ data: entry });
  } catch (err) {
    console.error('[Audit] Database write failed:', err);
  }
}
