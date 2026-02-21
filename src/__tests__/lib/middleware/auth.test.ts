import {
  signToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  hasMinimumRole,
  generateCsrfToken,
  withAuth,
  type TokenPayload,
  type UserRole,
} from '@/lib/middleware/auth';

// Helper to create a mock NextRequest
function createMockRequest(
  options: {
    method?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', cookies = {}, headers = {} } = options;
  const headerMap = new Map(Object.entries(headers));

  return {
    method,
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value ? { name, value } : undefined;
      },
    },
    headers: {
      get: (name: string) => headerMap.get(name) ?? null,
    },
    url: 'http://localhost:3000/api/test',
  } as unknown as import('next/server').NextRequest;
}

describe('Auth Middleware', () => {
  describe('signToken and verifyToken', () => {
    const testPayload = {
      sub: 'user-123',
      email: 'admin@medius.com',
      name: 'Admin User',
      role: 'ADMIN' as UserRole,
      tenantId: 'tenant-1',
      type: 'session' as const,
    };

    it('should sign and verify a token successfully', async () => {
      const token = await signToken(testPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts

      const payload = await verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('user-123');
      expect(payload?.email).toBe('admin@medius.com');
      expect(payload?.name).toBe('Admin User');
      expect(payload?.role).toBe('ADMIN');
      expect(payload?.tenantId).toBe('tenant-1');
    });

    it('should include standard JWT claims', async () => {
      const token = await signToken(testPayload);
      const payload = await verifyToken(token);

      expect(payload?.iss).toBe('medius-platform');
      expect(payload?.aud).toBe('medius-api');
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });

    it('should return null for an invalid token', async () => {
      const payload = await verifyToken('invalid.token.string');
      expect(payload).toBeNull();
    });

    it('should return null for a tampered token', async () => {
      const token = await signToken(testPayload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      const payload = await verifyToken(tampered);
      expect(payload).toBeNull();
    });

    it('should return null for an empty string', async () => {
      const payload = await verifyToken('');
      expect(payload).toBeNull();
    });

    it('should create different tokens for regular and remember-me sessions', async () => {
      const regularToken = await signToken(testPayload, false);
      const rememberToken = await signToken(testPayload, true);

      // Both should be valid
      expect(await verifyToken(regularToken)).not.toBeNull();
      expect(await verifyToken(rememberToken)).not.toBeNull();

      // They should be different (different expiry)
      expect(regularToken).not.toBe(rememberToken);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash a password and verify it correctly', async () => {
      const password = 'SecureP@ssw0rd!';
      const hash = await hashPassword(password);

      expect(typeof hash).toBe('string');
      expect(hash).toContain(':'); // salt:hash format

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const hash = await hashPassword('correct-password');
      const isValid = await verifyPassword('wrong-password', hash);
      expect(isValid).toBe(false);
    });

    it('should generate unique hashes for the same password', async () => {
      const hash1 = await hashPassword('same-password');
      const hash2 = await hashPassword('same-password');
      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should reject invalid hash formats', async () => {
      const isValid = await verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });

    it('should reject empty hash', async () => {
      const isValid = await verifyPassword('password', '');
      expect(isValid).toBe(false);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user role meets minimum', () => {
      expect(hasMinimumRole('ADMIN', 'ADMIN')).toBe(true);
      expect(hasMinimumRole('ADMIN', 'VIEWER')).toBe(true);
      expect(hasMinimumRole('APPROVER', 'AP_CLERK')).toBe(true);
    });

    it('should return false when user role is below minimum', () => {
      expect(hasMinimumRole('VIEWER', 'ADMIN')).toBe(false);
      expect(hasMinimumRole('AP_CLERK', 'APPROVER')).toBe(false);
      expect(hasMinimumRole('SUPPLIER', 'VIEWER')).toBe(false);
    });

    it('should handle same role comparison', () => {
      const roles: UserRole[] = ['ADMIN', 'APPROVER', 'AP_CLERK', 'VIEWER', 'SUPPLIER'];
      roles.forEach((role) => {
        expect(hasMinimumRole(role, role)).toBe(true);
      });
    });

    it('should place ADMIN as highest role', () => {
      const roles: UserRole[] = ['APPROVER', 'AP_CLERK', 'VIEWER', 'SUPPLIER'];
      roles.forEach((role) => {
        expect(hasMinimumRole('ADMIN', role)).toBe(true);
      });
    });

    it('should place SUPPLIER as lowest role', () => {
      const roles: UserRole[] = ['ADMIN', 'APPROVER', 'AP_CLERK', 'VIEWER'];
      roles.forEach((role) => {
        expect(hasMinimumRole('SUPPLIER', role)).toBe(false);
      });
    });
  });

  describe('generateCsrfToken', () => {
    it('should generate a hex string', () => {
      const token = generateCsrfToken();
      expect(typeof token).toBe('string');
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should generate a 64-character token (32 bytes)', () => {
      const token = generateCsrfToken();
      expect(token.length).toBe(64);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set(Array.from({ length: 10 }, () => generateCsrfToken()));
      expect(tokens.size).toBe(10);
    });
  });

  describe('withAuth', () => {
    it('should return 401 when no token is provided', async () => {
      const handler = jest.fn();
      const wrapped = withAuth(handler);
      const request = createMockRequest();

      const response = await wrapped(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Authentication required');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should return 401 for an invalid token', async () => {
      const handler = jest.fn();
      const wrapped = withAuth(handler);
      const request = createMockRequest({
        cookies: { medius_session: 'invalid-token' },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler with valid token from cookie', async () => {
      const token = await signToken({
        sub: 'user-1',
        email: 'test@medius.com',
        name: 'Test User',
        role: 'ADMIN',
        tenantId: 'tenant-1',
        type: 'session',
      });

      const handler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
      const wrapped = withAuth(handler, { skipCsrf: true });
      const request = createMockRequest({
        cookies: { medius_session: token },
      });

      await wrapped(request);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should call handler with valid token from Authorization header', async () => {
      const token = await signToken({
        sub: 'user-1',
        email: 'test@medius.com',
        name: 'Test User',
        role: 'ADMIN',
        tenantId: 'tenant-1',
        type: 'session',
      });

      const handler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
      const wrapped = withAuth(handler, { skipCsrf: true });
      const request = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });

      await wrapped(request);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should reject users without required role', async () => {
      const token = await signToken({
        sub: 'user-1',
        email: 'viewer@medius.com',
        name: 'Viewer User',
        role: 'VIEWER',
        tenantId: 'tenant-1',
        type: 'session',
      });

      const handler = jest.fn();
      const wrapped = withAuth(handler, { roles: ['ADMIN'], skipCsrf: true });
      const request = createMockRequest({
        cookies: { medius_session: token },
      });

      const response = await wrapped(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('Insufficient permissions');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow users with required role', async () => {
      const token = await signToken({
        sub: 'user-1',
        email: 'admin@medius.com',
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: 'tenant-1',
        type: 'session',
      });

      const handler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
      const wrapped = withAuth(handler, { roles: ['ADMIN', 'APPROVER'], skipCsrf: true });
      const request = createMockRequest({
        cookies: { medius_session: token },
      });

      await wrapped(request);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
