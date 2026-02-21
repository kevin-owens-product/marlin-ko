import {
  successResponse,
  errorResponse,
  apiSuccess,
  apiError,
  paginatedResponse,
  validationErrorResponse,
  apiErrorFromCode,
  handleError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  API_ERRORS,
} from '@/lib/api/response';

describe('API Response Helpers', () => {
  describe('successResponse', () => {
    it('should return a successful response with data', async () => {
      const data = { id: '1', name: 'Test' };
      const response = successResponse(data);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.meta).toBeUndefined();
    });

    it('should accept a custom status code', async () => {
      const data = { id: '1' };
      const response = successResponse(data, 201);

      expect(response.status).toBe(201);
    });

    it('should include meta when provided', async () => {
      const data = [{ id: '1' }];
      const meta = { pagination: { page: 1, limit: 10, totalCount: 50, totalPages: 5, hasNext: true, hasPrevious: false } };
      const response = successResponse(data, 200, meta);
      const body = await response.json();

      expect(body.meta).toEqual(meta);
    });

    it('should handle null data', async () => {
      const response = successResponse(null);
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });

    it('should handle empty array data', async () => {
      const response = successResponse([]);
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  describe('apiSuccess', () => {
    it('should be an alias for successResponse', async () => {
      const data = { message: 'hello' };
      const response = apiSuccess(data);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });

    it('should accept a custom status code', async () => {
      const response = apiSuccess({ created: true }, 201);
      expect(response.status).toBe(201);
    });
  });

  describe('errorResponse', () => {
    it('should return an error response with message', async () => {
      const response = errorResponse('Something went wrong', 400);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Something went wrong');
      expect(body.details).toBeUndefined();
    });

    it('should default to status 500', async () => {
      const response = errorResponse('Internal error');
      expect(response.status).toBe(500);
    });

    it('should include details when provided', async () => {
      const details = { email: ['Email is required'], name: ['Name is too short'] };
      const response = errorResponse('Validation failed', 400, details);
      const body = await response.json();

      expect(body.details).toEqual(details);
    });

    it('should accept string details', async () => {
      const response = errorResponse('Error', 400, 'Additional info');
      const body = await response.json();

      expect(body.details).toBe('Additional info');
    });
  });

  describe('apiError', () => {
    it('should return an error response', async () => {
      const response = apiError('Bad request', 400);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Bad request');
    });

    it('should stringify object details', async () => {
      const response = apiError('Error', 400, { field: 'value' });
      const body = await response.json();

      expect(body.details).toBe(JSON.stringify({ field: 'value' }));
    });
  });

  describe('paginatedResponse', () => {
    it('should return a paginated response', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const pagination = {
        page: 1,
        limit: 10,
        totalCount: 50,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false,
      };
      const response = paginatedResponse(data, pagination);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.meta?.pagination).toEqual(pagination);
    });

    it('should handle empty data array', async () => {
      const pagination = {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      const response = paginatedResponse([], pagination);
      const body = await response.json();

      expect(body.data).toEqual([]);
      expect(body.meta?.pagination?.totalCount).toBe(0);
    });
  });

  describe('validationErrorResponse', () => {
    it('should return a 400 response with field errors', async () => {
      const errors = {
        email: ['Email is required', 'Must be a valid email'],
        password: ['Password must be at least 8 characters'],
      };
      const response = validationErrorResponse(errors);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(errors);
    });
  });

  describe('apiErrorFromCode', () => {
    it('should return the correct response for UNAUTHORIZED', async () => {
      const response = apiErrorFromCode('UNAUTHORIZED');
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe(API_ERRORS.UNAUTHORIZED.message);
    });

    it('should return the correct response for NOT_FOUND', async () => {
      const response = apiErrorFromCode('NOT_FOUND');
      expect(response.status).toBe(404);
    });

    it('should use custom message when provided', async () => {
      const response = apiErrorFromCode('NOT_FOUND', 'Invoice not found');
      const body = await response.json();

      expect(body.error).toBe('Invoice not found');
    });

    it('should handle all error codes', () => {
      const codes: Array<keyof typeof API_ERRORS> = [
        'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION',
        'CONFLICT', 'RATE_LIMITED', 'INTERNAL',
      ];

      codes.forEach((code) => {
        const response = apiErrorFromCode(code);
        expect(response.status).toBe(API_ERRORS[code].status);
      });
    });
  });

  describe('handleError', () => {
    it('should handle HttpError instances', async () => {
      const error = new HttpError('Custom error', 422);
      const response = handleError(error);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toBe('Custom error');
    });

    it('should handle HttpError with details', async () => {
      const error = new HttpError('Bad request', 400, { field: ['error'] });
      const response = handleError(error);
      const body = await response.json();

      expect(body.details).toEqual({ field: ['error'] });
    });

    it('should return 500 for unknown errors', async () => {
      const response = handleError(new Error('unexpected'));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });

    it('should return 500 for non-Error objects', async () => {
      const response = handleError('string error');
      expect(response.status).toBe(500);
    });

    it('should not leak internal error details', async () => {
      const response = handleError(new Error('Database connection failed at 192.168.1.1'));
      const body = await response.json();

      expect(body.error).not.toContain('192.168.1.1');
      expect(body.error).toBe('Internal server error');
    });
  });

  describe('HTTP Error Classes', () => {
    it('should create BadRequestError with correct defaults', () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
    });

    it('should create UnauthorizedError with correct defaults', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should create ForbiddenError with correct defaults', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
    });

    it('should create NotFoundError with correct defaults', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
    });

    it('should create ConflictError with correct defaults', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
    });

    it('should create TooManyRequestsError with correct defaults', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
    });

    it('should create InternalServerError with correct defaults', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
    });

    it('should accept custom messages', () => {
      const error = new NotFoundError('Invoice #123 not found');
      expect(error.message).toBe('Invoice #123 not found');
      expect(error.statusCode).toBe(404);
    });

    it('should accept details in BadRequestError', () => {
      const details = { email: ['Invalid email format'] };
      const error = new BadRequestError('Validation failed', details);
      expect(error.details).toEqual(details);
    });

    it('should be instances of HttpError', () => {
      expect(new BadRequestError()).toBeInstanceOf(HttpError);
      expect(new UnauthorizedError()).toBeInstanceOf(HttpError);
      expect(new NotFoundError()).toBeInstanceOf(HttpError);
    });
  });
});
