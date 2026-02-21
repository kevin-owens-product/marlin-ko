/**
 * Standardized API Response Helpers
 *
 * Provides consistent response shapes across all API routes in the Medius platform.
 * All responses conform to the ApiResponse<T> envelope format.
 *
 * Success: { success: true, data: T, meta?: { pagination?, ... } }
 * Error:   { success: false, error: string, details?: ... }
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]> | string;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Standard error codes
// ---------------------------------------------------------------------------

export const API_ERRORS = {
  UNAUTHORIZED: { message: 'Authentication required', status: 401 },
  FORBIDDEN: { message: 'Insufficient permissions', status: 403 },
  NOT_FOUND: { message: 'Resource not found', status: 404 },
  VALIDATION: { message: 'Validation failed', status: 400 },
  CONFLICT: { message: 'Resource already exists', status: 409 },
  RATE_LIMITED: { message: 'Too many requests', status: 429 },
  INTERNAL: { message: 'Internal server error', status: 500 },
} as const;

export type ApiErrorCode = keyof typeof API_ERRORS;

// ---------------------------------------------------------------------------
// HTTP Error classes
// ---------------------------------------------------------------------------

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]> | string;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, string[]> | string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', details?: Record<string, string[]> | string) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

/**
 * Build a successful JSON response.
 *
 * @param data - The response payload
 * @param status - HTTP status code (default: 200)
 * @param meta - Optional metadata (pagination, etc.)
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse<T>['meta'],
): NextResponse<ApiResponse<T>> {
  const body: ApiResponse<T> = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return NextResponse.json(body, { status });
}

/** Alias for convenience: `apiSuccess(data, status)` */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return successResponse(data, status);
}

/**
 * Build a generic error JSON response.
 *
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 500)
 * @param details - Optional structured error details
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, string[]> | string,
): NextResponse<ApiResponse<never>> {
  const body: ApiResponse<never> = { success: false, error: message };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

/** Alias for convenience: `apiError(message, status, details)` */
export function apiError(
  message: string,
  status: number = 500,
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  const body: ApiResponse<never> = { success: false, error: message };
  if (details !== undefined) {
    body.details = typeof details === 'string' ? details : JSON.stringify(details);
  }
  return NextResponse.json(body, { status });
}

/**
 * Build a paginated success response.
 *
 * @param data - Array of items for the current page
 * @param pagination - Pagination metadata
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: { pagination },
    },
    { status: 200 },
  );
}

/** Alias for convenience: `apiPaginated(data, pagination)` */
export function apiPaginated<T>(
  data: T[],
  pagination: PaginationMeta,
): NextResponse<ApiResponse<T[]>> {
  return paginatedResponse(data, pagination);
}

/**
 * Build a 400 validation-error response from a map of field errors.
 *
 * @param errors - Record mapping field names to arrays of error messages
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
): NextResponse<ApiResponse<never>> {
  return errorResponse('Validation failed', 400, errors);
}

/**
 * Build a response from a standard API error code.
 *
 * @param code - One of the API_ERRORS keys
 * @param customMessage - Optional override for the default message
 */
export function apiErrorFromCode(
  code: ApiErrorCode,
  customMessage?: string,
): NextResponse<ApiResponse<never>> {
  const errorDef = API_ERRORS[code];
  return errorResponse(customMessage ?? errorDef.message, errorDef.status);
}

/**
 * Convert an HttpError (or unknown error) into a NextResponse.
 * Safely handles both known HttpError instances and unexpected errors.
 */
export function handleError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof HttpError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  // Never leak internal details in production
  console.error('[API] Unhandled error:', error);
  return errorResponse('Internal server error', 500);
}
