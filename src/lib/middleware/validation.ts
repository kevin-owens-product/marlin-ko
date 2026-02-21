/**
 * Request Validation Middleware
 *
 * Validates incoming request bodies (POST/PUT/PATCH) and query parameters (GET)
 * against Zod schemas. Returns structured 400 errors with field-level details
 * on failure.
 *
 * Provides both standalone validation functions (validateBody, validateQuery)
 * and a composable middleware wrapper (withValidation).
 *
 * Usage:
 *   import { z } from 'zod';
 *   import { withValidation, validateBody } from '@/lib/middleware/validation';
 *
 *   // Middleware wrapper approach
 *   const schema = z.object({ name: z.string().min(1) });
 *   export const POST = withValidation(schema, async (req) => {
 *     const data = req.validatedData; // fully typed
 *     // ...
 *   });
 *
 *   // Standalone approach
 *   export async function POST(req: NextRequest) {
 *     const data = await validateBody(req, schema);
 *     // data is typed or an error response is returned
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { type ZodType, type ZodError, ZodObject } from 'zod';
import { validationErrorResponse, errorResponse, type ApiResponse } from '@/lib/api/response';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidatedRequest<T = unknown> extends NextRequest {
  /** The validated & parsed request data. */
  validatedData: T;
}

export interface ValidationOptions {
  /**
   * Where to read data from.
   *   - 'auto': body for POST/PUT/PATCH, query for GET/DELETE (default)
   *   - 'body': always parse the JSON body
   *   - 'query': always parse query parameters
   */
  source?: 'auto' | 'body' | 'query';
}

/** Field-level validation error detail */
export interface ValidationDetail {
  field: string;
  message: string;
}

type ValidatedHandler<T> = (
  request: ValidatedRequest<T>,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse<ApiResponse>>;

// ---------------------------------------------------------------------------
// Error formatting
// ---------------------------------------------------------------------------

/**
 * Format ZodError into a Record<field, messages[]> for the API response.
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Format ZodError into a flat array of { field, message } details.
 * Useful for consumers that prefer a simpler error shape.
 */
function formatZodErrorsFlat(error: ZodError): ValidationDetail[] {
  const details: ValidationDetail[] = [];
  for (const issue of error.issues) {
    details.push({
      field: issue.path.length > 0 ? issue.path.join('.') : '_root',
      message: issue.message,
    });
  }
  return details;
}

// ---------------------------------------------------------------------------
// Query parameter extraction
// ---------------------------------------------------------------------------

/**
 * Extract query parameters from the request URL and coerce common types.
 * Handles comma-separated values as arrays, booleans, integers, and floats.
 */
function extractQueryParams(request: NextRequest): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    // Handle comma-separated values as arrays
    if (value.includes(',')) {
      params[key] = value.split(',').map((v) => v.trim());
    } else if (value === 'true') {
      params[key] = true;
    } else if (value === 'false') {
      params[key] = false;
    } else if (/^\d+$/.test(value)) {
      params[key] = parseInt(value, 10);
    } else if (/^\d+\.\d+$/.test(value)) {
      params[key] = parseFloat(value);
    } else {
      params[key] = value;
    }
  });
  return params;
}

// ---------------------------------------------------------------------------
// Standalone validation functions
// ---------------------------------------------------------------------------

/**
 * Validate the JSON body of a request against a Zod schema.
 *
 * On success, returns the parsed and typed data.
 * On failure, returns a NextResponse with a 400 status and field-level error details.
 *
 * ```ts
 * const result = await validateBody(req, CreateInvoiceSchema);
 * if (result instanceof NextResponse) return result; // validation error
 * // result is typed as CreateInvoiceInput
 * ```
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodType<T>,
): Promise<T | NextResponse<ApiResponse>> {
  let rawData: unknown;
  try {
    rawData = await req.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const result = schema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error as ZodError);
    return validationErrorResponse(fieldErrors);
  }

  return result.data;
}

/**
 * Validate the query parameters of a request against a Zod schema.
 *
 * On success, returns the parsed and typed data.
 * On failure, returns a NextResponse with a 400 status and field-level error details.
 *
 * ```ts
 * const result = validateQuery(req, InvoiceQuerySchema);
 * if (result instanceof NextResponse) return result; // validation error
 * // result is typed as InvoiceQuery
 * ```
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: ZodType<T>,
): T | NextResponse<ApiResponse> {
  const rawData = extractQueryParams(req);
  const result = schema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = formatZodErrors(result.error as ZodError);
    return validationErrorResponse(fieldErrors);
  }

  return result.data;
}

// ---------------------------------------------------------------------------
// Middleware wrapper: withValidation()
// ---------------------------------------------------------------------------

/**
 * Wrap a route handler with Zod-based request validation.
 *
 * Validates the request body (POST/PUT/PATCH) or query params (GET/DELETE)
 * against the provided schema. On success, the validated data is attached
 * to `req.validatedData`.
 *
 * ```ts
 * const CreateInvoiceSchema = z.object({
 *   invoiceNumber: z.string().min(1),
 *   vendorName: z.string().min(1),
 *   totalAmount: z.number().positive(),
 * });
 *
 * export const POST = withValidation(CreateInvoiceSchema, async (req) => {
 *   const { invoiceNumber, vendorName, totalAmount } = req.validatedData;
 *   // ...
 * });
 * ```
 */
export function withValidation<T>(
  schema: ZodType<T>,
  handler: ValidatedHandler<T>,
  options?: ValidationOptions,
) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const source = options?.source ?? 'auto';
    const method = request.method.toUpperCase();
    const useBody =
      source === 'body' ||
      (source === 'auto' && ['POST', 'PUT', 'PATCH'].includes(method));

    let rawData: unknown;

    if (useBody) {
      try {
        rawData = await request.json();
      } catch {
        return errorResponse('Invalid JSON in request body', 400);
      }
    } else {
      rawData = extractQueryParams(request);
    }

    const result = schema.safeParse(rawData);

    if (!result.success) {
      return validationErrorResponse(formatZodErrors(result.error as ZodError));
    }

    // Attach validated data to request
    const validatedRequest = request as ValidatedRequest<T>;
    validatedRequest.validatedData = result.data;

    return handler(validatedRequest, context);
  };
}

// ---------------------------------------------------------------------------
// Composable schema helpers
// ---------------------------------------------------------------------------

/**
 * Create a partial (update) schema from a create schema.
 * All fields become optional, but at least one must be provided.
 */
export function createUpdateSchema<T extends Record<string, ZodType>>(
  createSchema: ZodObject<T>,
) {
  return createSchema.partial().refine(
    (data: Record<string, unknown>) => Object.values(data).some((v) => v !== undefined),
    { message: 'At least one field must be provided for update' },
  );
}
