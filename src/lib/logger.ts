/**
 * Structured JSON Logger for Medius AP Automation Platform
 *
 * Features:
 * - Structured JSON output: { timestamp, level, message, ...context }
 * - Log levels: debug, info, warn, error (configurable via LOG_LEVEL)
 * - Request ID tracking for distributed tracing
 * - Automatic sensitive data redaction (passwords, tokens, secrets, apiKey, authorization)
 * - Child logger support with inherited context
 * - Request-scoped logger factory for Next.js API routes
 * - Works in both Node.js and Edge runtimes
 * - Operation timing support for performance monitoring
 *
 * Usage:
 *   import { logger, createRequestLogger } from '@/lib/logger';
 *
 *   logger.info('Invoice processed', { invoiceId: 'inv_001', amount: 5000 });
 *
 *   const reqLogger = logger.child({ requestId: '...', tenantId: '...', userId: '...' });
 *   reqLogger.info('Payment approved');
 *
 *   const log = createRequestLogger(req);
 *   log.info('API request received');
 */

// ─── Types ────────────────────────────────────────────────────

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

interface LoggerContext {
  [key: string]: unknown;
}

interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger;
  time<T>(operation: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T>;
}

// ─── Constants ────────────────────────────────────────────────

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Keys whose values should always be redacted in log output.
 * Matching is case-insensitive.
 */
const SENSITIVE_KEYS: Set<string> = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'secret',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'apikey',
  'api_key',
  'keyhash',
  'key_hash',
  'authorization',
  'cookie',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'ssn',
  'social_security',
  'private_key',
  'privatekey',
  'smtp_pass',
  'smtp_password',
  'webhook_secret',
  'signing_secret',
  'jwt_secret',
]);

/**
 * Regex patterns to detect and redact sensitive values inline in strings.
 */
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Credit card numbers (16 digits, optionally with dashes/spaces)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '****-****-****-****' },
  // Bearer tokens
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: 'Bearer [REDACTED]' },
  // JWT tokens (three base64url parts separated by dots)
  { pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: '[REDACTED_JWT]' },
  // Common API key patterns (sk_, pk_, rk_, ak_ prefixes)
  { pattern: /\b(sk_|pk_|rk_|ak_)[a-zA-Z0-9]{20,}\b/g, replacement: '[REDACTED_KEY]' },
];

const REDACTED_VALUE = '[REDACTED]';

// ─── StructuredLogger Class ───────────────────────────────────

class StructuredLogger implements Logger {
  private context: LoggerContext;
  private minLevel: LogLevel;

  constructor(context?: LoggerContext, minLevel?: LogLevel) {
    this.context = context ?? {};
    this.minLevel = minLevel ?? this.getConfiguredLevel();
  }

  debug(message: string, data?: LoggerContext): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LoggerContext): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LoggerContext): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LoggerContext | Error): void {
    if (data instanceof Error) {
      this.log('error', message, {
        error: {
          name: data.name,
          message: data.message,
          stack: data.stack,
        },
      });
    } else {
      this.log('error', message, data);
    }
  }

  child(context: LoggerContext): Logger {
    return new StructuredLogger(
      { ...this.context, ...context },
      this.minLevel,
    );
  }

  async time<T>(operation: string, fn: () => Promise<T>, data?: LoggerContext): Promise<T> {
    const start = Date.now();
    this.debug(`${operation} started`, data);

    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      this.info(`${operation} completed`, { ...data, durationMs });
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      this.error(`${operation} failed`, {
        ...data,
        durationMs,
        error: err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : String(err),
      });
      throw err;
    }
  }

  // ─── Private methods ────────────────────────────────────────

  private log(level: LogLevel, message: string, data?: LoggerContext): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...this.redact(data ?? {}),
    };

    const serialized = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(serialized);
        break;
      case 'info':
        console.info(serialized);
        break;
      case 'warn':
        console.warn(serialized);
        break;
      case 'error':
        console.error(serialized);
        break;
    }
  }

  private redact(data: LoggerContext): LoggerContext {
    return this.redactValue(data) as LoggerContext;
  }

  private redactValue(value: unknown, depth: number = 0): unknown {
    if (depth > 10) return '[MAX_DEPTH]';
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return this.redactString(value);
    if (typeof value === 'number' || typeof value === 'boolean') return value;

    if (Array.isArray(value)) {
      return value.map((item) => this.redactValue(item, depth + 1));
    }

    if (typeof value === 'object') {
      const redacted: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          redacted[key] = REDACTED_VALUE;
        } else {
          redacted[key] = this.redactValue(val, depth + 1);
        }
      }
      return redacted;
    }

    return String(value);
  }

  private redactString(value: string): string {
    let result = value;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      pattern.lastIndex = 0;
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  private getConfiguredLevel(): LogLevel {
    try {
      const envLevel = (typeof process !== 'undefined' && process.env?.LOG_LEVEL) || '';
      const normalized = envLevel.toLowerCase() as LogLevel;
      if (normalized in LOG_LEVEL_PRIORITY) {
        return normalized;
      }
      const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development';
      return nodeEnv === 'production' ? 'info' : 'debug';
    } catch {
      return 'info';
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────

const globalForLogger = globalThis as unknown as { __mediusLogger: Logger };

export const logger: Logger =
  globalForLogger.__mediusLogger || new StructuredLogger();

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  globalForLogger.__mediusLogger = logger;
}

// ─── Request-Scoped Logger Factory ────────────────────────────

/**
 * Create a request-scoped logger that automatically extracts context
 * from the incoming Next.js request (request ID, IP, user agent, path).
 *
 * @example
 *   export async function GET(req: NextRequest) {
 *     const log = createRequestLogger(req);
 *     log.info('Processing request');
 *   }
 */
export function createRequestLogger(req: {
  headers: { get(name: string): string | null };
  url?: string;
  nextUrl?: { pathname: string };
}): Logger {
  const requestId =
    req.headers.get('x-request-id') ||
    req.headers.get('x-correlation-id') ||
    generateRequestId();

  const path = req.nextUrl?.pathname || tryExtractPath(req.url);

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  return logger.child({
    requestId,
    path,
    ip,
    userAgent: req.headers.get('user-agent') || undefined,
  });
}

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

function tryExtractPath(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// ─── Exports ──────────────────────────────────────────────────

export { StructuredLogger };
export type { LogLevel, LogEntry, LoggerContext, Logger as LoggerInterface };
