/**
 * Structured JSON Logger for Medius AP Automation Platform
 *
 * Features:
 * - Structured JSON output: { timestamp, level, message, ...context }
 * - Log levels: debug, info, warn, error
 * - Request ID tracking for distributed tracing
 * - Sensitive data redaction (passwords, tokens, card numbers, secrets)
 * - Child logger support with inherited context
 * - Works in both Node.js and Edge runtimes
 * - Configurable via LOG_LEVEL environment variable
 */

// ─── Types ────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  [key: string]: unknown
}

interface LoggerContext {
  [key: string]: unknown
}

// ─── Constants ────────────────────────────────────────────────

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

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
])

/**
 * Regex patterns to detect and redact sensitive values inline.
 */
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Credit card numbers (16 digits, optionally with dashes/spaces)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '****-****-****-****' },
  // Bearer tokens
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: 'Bearer [REDACTED]' },
  // JWT tokens (three base64 parts separated by dots)
  { pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: '[REDACTED_JWT]' },
  // Email-like patterns in passwords context
  // API key patterns (common prefixes)
  { pattern: /\b(sk_|pk_|rk_|ak_)[a-zA-Z0-9]{20,}\b/g, replacement: '[REDACTED_KEY]' },
]

const REDACTED_VALUE = '[REDACTED]'

// ─── Logger Class ─────────────────────────────────────────────

class Logger {
  private context: LoggerContext
  private minLevel: LogLevel

  constructor(context?: LoggerContext, minLevel?: LogLevel) {
    this.context = context ?? {}
    this.minLevel = minLevel ?? this.getConfiguredLevel()
  }

  /**
   * Log a debug message. Only emitted when LOG_LEVEL=debug.
   */
  debug(message: string, data?: LoggerContext): void {
    this.log('debug', message, data)
  }

  /**
   * Log an informational message.
   */
  info(message: string, data?: LoggerContext): void {
    this.log('info', message, data)
  }

  /**
   * Log a warning message.
   */
  warn(message: string, data?: LoggerContext): void {
    this.log('warn', message, data)
  }

  /**
   * Log an error message. Supports Error objects with stack traces.
   */
  error(message: string, data?: LoggerContext | Error): void {
    if (data instanceof Error) {
      this.log('error', message, {
        error: {
          name: data.name,
          message: data.message,
          stack: data.stack,
        },
      })
    } else {
      this.log('error', message, data)
    }
  }

  /**
   * Create a child logger that inherits the parent's context
   * and adds additional context fields.
   *
   * Useful for adding request-scoped context:
   *   const reqLogger = logger.child({ requestId, userId, tenantId })
   */
  child(context: LoggerContext): Logger {
    return new Logger(
      { ...this.context, ...context },
      this.minLevel,
    )
  }

  /**
   * Create a child logger with a request ID for distributed tracing.
   */
  withRequestId(requestId: string): Logger {
    return this.child({ requestId })
  }

  /**
   * Measure the duration of an async operation.
   * Logs the operation name and duration in milliseconds.
   */
  async time<T>(operation: string, fn: () => Promise<T>, data?: LoggerContext): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const durationMs = Date.now() - start
      this.info(`${operation} completed`, { ...data, durationMs })
      return result
    } catch (err) {
      const durationMs = Date.now() - start
      this.error(`${operation} failed`, {
        ...data,
        durationMs,
        error: err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : String(err),
      })
      throw err
    }
  }

  // ─── Private methods ────────────────────────────────────────

  private log(level: LogLevel, message: string, data?: LoggerContext): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...this.redact(data ?? {}),
    }

    const serialized = JSON.stringify(entry)

    switch (level) {
      case 'debug':
        console.debug(serialized)
        break
      case 'info':
        console.info(serialized)
        break
      case 'warn':
        console.warn(serialized)
        break
      case 'error':
        console.error(serialized)
        break
    }
  }

  /**
   * Recursively redact sensitive data from log context.
   */
  private redact(data: LoggerContext): LoggerContext {
    return this.redactValue(data) as LoggerContext
  }

  private redactValue(value: unknown, depth: number = 0): unknown {
    // Prevent infinite recursion on deeply nested objects
    if (depth > 10) {
      return '[MAX_DEPTH]'
    }

    if (value === null || value === undefined) {
      return value
    }

    if (typeof value === 'string') {
      return this.redactString(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.redactValue(item, depth + 1))
    }

    if (typeof value === 'object') {
      const redacted: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          redacted[key] = REDACTED_VALUE
        } else {
          redacted[key] = this.redactValue(val, depth + 1)
        }
      }
      return redacted
    }

    return String(value)
  }

  /**
   * Apply regex-based redaction to string values.
   */
  private redactString(value: string): string {
    let result = value
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0
      result = result.replace(pattern, replacement)
    }
    return result
  }

  /**
   * Determine the minimum log level from environment configuration.
   */
  private getConfiguredLevel(): LogLevel {
    try {
      const envLevel = (typeof process !== 'undefined' && process.env?.LOG_LEVEL) || ''
      const normalized = envLevel.toLowerCase() as LogLevel
      if (normalized in LOG_LEVEL_PRIORITY) {
        return normalized
      }

      // Default: debug in development, info in production
      const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development'
      return nodeEnv === 'production' ? 'info' : 'debug'
    } catch {
      // Edge runtime may not have process.env
      return 'info'
    }
  }
}

// ─── Singleton Export ─────────────────────────────────────────

const globalForLogger = globalThis as unknown as { __mediusLogger: Logger }

export const logger: Logger =
  globalForLogger.__mediusLogger || new Logger()

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  globalForLogger.__mediusLogger = logger
}

export { Logger }
export type { LogLevel, LogEntry, LoggerContext }
