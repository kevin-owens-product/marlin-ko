/**
 * Unified Cache Layer for Medius AP Automation Platform
 *
 * Provides a dual-backend caching system:
 * - Redis (production): Uses ioredis when REDIS_URL env var is set
 * - In-Memory (development/fallback): LRU cache with TTL support
 *
 * Features:
 * - Automatic Redis detection and graceful fallback to in-memory
 * - TTL (time-to-live) per entry with configurable defaults
 * - LRU eviction when in-memory cache reaches max capacity
 * - Pattern-based key invalidation (flush)
 * - Pre-configured cache instances for common use cases
 * - Cache decorator for wrapping async functions
 * - Singleton pattern for Next.js hot reload
 *
 * Usage:
 *   import { dashboardCache, sessionCache, cached } from '@/lib/cache';
 *
 *   // Direct usage
 *   await dashboardCache.set('stats', data);
 *   const stats = await dashboardCache.get<Stats>('stats');
 *
 *   // Decorator pattern
 *   const data = await cached('dashboard:stats', fetchStats, 30);
 */

// ─── Types ────────────────────────────────────────────────────

interface CacheOptions {
  /** TTL in seconds. Default: 300 (5 minutes) */
  ttl?: number;
  /** Key prefix for namespace isolation */
  prefix?: string;
  /** Maximum number of entries for in-memory cache. Default: 1000 */
  maxSize?: number;
}

interface CacheClient {
  /** Retrieve a cached value. Returns null if key doesn't exist or has expired. */
  get<T>(key: string): Promise<T | null>;
  /** Store a value with optional TTL override (in seconds). */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  /** Delete a specific key from the cache. */
  del(key: string): Promise<void>;
  /** Delete all keys matching a glob pattern, or all keys if no pattern given. */
  flush(pattern?: string): Promise<void>;
  /** Check if a key exists and is not expired. */
  has(key: string): Promise<boolean>;
}

interface InMemoryEntry {
  value: string; // JSON-serialized
  expiresAt: number; // Unix timestamp in ms
  lastAccessedAt: number;
}

// ─── In-Memory Cache Backend ──────────────────────────────────

/**
 * LRU-style in-memory cache with TTL support.
 * Used as the primary cache in development or as a fallback when Redis is unavailable.
 */
class InMemoryCache implements CacheClient {
  private store = new Map<string, InMemoryEntry>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private readonly prefix: string;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTtlMs = (options.ttl ?? 300) * 1000;
    this.prefix = options.prefix ? `${options.prefix}:` : '';
    this.maxSize = options.maxSize ?? 1000;
    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.prefix + key;
    const entry = this.store.get(fullKey);

    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(fullKey);
      return null;
    }

    // Update last accessed time for LRU tracking
    entry.lastAccessedAt = Date.now();

    try {
      return JSON.parse(entry.value) as T;
    } catch {
      // Corrupted entry, remove it
      this.store.delete(fullKey);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const fullKey = this.prefix + key;
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    const now = Date.now();

    // Evict LRU entry if at capacity and this is a new key
    if (!this.store.has(fullKey) && this.store.size >= this.maxSize) {
      this.evictLRU();
    }

    this.store.set(fullKey, {
      value: JSON.stringify(value),
      expiresAt: now + ttlMs,
      lastAccessedAt: now,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(this.prefix + key);
  }

  async flush(pattern?: string): Promise<void> {
    if (!pattern) {
      // Clear all entries with this prefix
      if (this.prefix) {
        const keysToDelete: string[] = [];
        for (const key of this.store.keys()) {
          if (key.startsWith(this.prefix)) {
            keysToDelete.push(key);
          }
        }
        for (const key of keysToDelete) {
          this.store.delete(key);
        }
      } else {
        this.store.clear();
      }
      return;
    }

    // Pattern-based deletion (supports * wildcard)
    const fullPattern = this.prefix + pattern;
    const regex = new RegExp(
      '^' + fullPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'
    );

    const keysToDelete: string[] = [];
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.store.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    const fullKey = this.prefix + key;
    const entry = this.store.get(fullKey);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(fullKey);
      return false;
    }
    return true;
  }

  /** Remove the least recently accessed entry */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    // First pass: try to evict an expired entry
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        return;
      }
      if (entry.lastAccessedAt < oldestAccess) {
        oldestAccess = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    // No expired entries found, evict LRU
    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  /** Periodic cleanup of expired entries every 60 seconds */
  private startCleanup(): void {
    try {
      this.cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
          if (now > entry.expiresAt) {
            this.store.delete(key);
          }
        }
      }, 60_000);

      // Prevent the interval from keeping the Node.js process alive
      if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
        (this.cleanupTimer as NodeJS.Timeout).unref();
      }
    } catch {
      // Silently ignore if setInterval is unavailable (Edge runtime)
      this.cleanupTimer = null;
    }
  }

  /** Stop the cleanup timer and clear all entries. Call during shutdown. */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

// ─── Redis Cache Backend ──────────────────────────────────────

/**
 * Redis-backed cache using ioredis.
 * Automatically falls back to in-memory if Redis connection fails.
 */
class RedisCache implements CacheClient {
  private redis: import('ioredis').default | null = null;
  private fallback: InMemoryCache;
  private readonly defaultTtlSeconds: number;
  private readonly prefix: string;
  private connected = false;

  constructor(redisUrl: string, options: CacheOptions = {}) {
    this.defaultTtlSeconds = options.ttl ?? 300;
    this.prefix = options.prefix ? `medius:${options.prefix}:` : 'medius:';
    this.fallback = new InMemoryCache(options);
    this.initRedis(redisUrl);
  }

  private async initRedis(url: string): Promise<void> {
    try {
      const Redis = (await import('ioredis')).default;
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 3) return null;
          return Math.min(times * 50, 200);
        },
        lazyConnect: false,
        enableReadyCheck: true,
        connectTimeout: 5000,
      });
      this.redis.on('connect', () => { this.connected = true; });
      this.redis.on('error', () => { this.connected = false; });
      this.redis.on('close', () => { this.connected = false; });
    } catch {
      this.connected = false;
    }
  }

  private isAvailable(): boolean {
    return this.connected && this.redis !== null;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return this.fallback.get<T>(key);
    try {
      const raw = await this.redis!.get(this.prefix + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    if (!this.isAvailable()) return this.fallback.set(key, value, ttl);
    try {
      await this.redis!.setex(this.prefix + key, ttl, JSON.stringify(value));
    } catch {
      await this.fallback.set(key, value, ttl);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) return this.fallback.del(key);
    try {
      await this.redis!.del(this.prefix + key);
    } catch {
      await this.fallback.del(key);
    }
  }

  async flush(pattern?: string): Promise<void> {
    if (!this.isAvailable()) return this.fallback.flush(pattern);
    try {
      const scanPattern = pattern ? this.prefix + pattern : this.prefix + '*';
      const stream = this.redis!.scanStream({ match: scanPattern, count: 100 });
      const pipeline = this.redis!.pipeline();
      let count = 0;
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          for (const k of keys) { pipeline.del(k); count++; }
        });
        stream.on('end', () => {
          if (count > 0) { pipeline.exec().then(() => resolve()).catch(reject); }
          else { resolve(); }
        });
        stream.on('error', reject);
      });
    } catch {
      await this.fallback.flush(pattern);
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isAvailable()) return this.fallback.has(key);
    try {
      return (await this.redis!.exists(this.prefix + key)) === 1;
    } catch {
      return this.fallback.has(key);
    }
  }
}

// ─── Cache Factory ────────────────────────────────────────────

/**
 * Create a cache client based on environment configuration.
 * Uses Redis when REDIS_URL is set, otherwise falls back to in-memory.
 */
function createCacheClient(options: CacheOptions = {}): CacheClient {
  const redisUrl = typeof process !== 'undefined' ? process.env?.REDIS_URL : undefined;
  if (redisUrl) {
    return new RedisCache(redisUrl, options);
  }
  return new InMemoryCache(options);
}

// ─── Pre-configured Cache Instances ───────────────────────────
// These are singletons that persist across hot reloads in development

const globalForCache = globalThis as unknown as {
  __mediusDashboardCache?: CacheClient;
  __mediusSessionCache?: CacheClient;
  __mediusSettingsCache?: CacheClient;
  __mediusReportCache?: CacheClient;
  __mediusDefaultCache?: CacheClient;
};

/** Dashboard data cache - short TTL for real-time feel (30 seconds) */
export const dashboardCache: CacheClient =
  globalForCache.__mediusDashboardCache ??
  createCacheClient({ ttl: 30, prefix: 'dashboard' });

/** Session cache - moderate TTL (15 minutes) */
export const sessionCache: CacheClient =
  globalForCache.__mediusSessionCache ??
  createCacheClient({ ttl: 900, prefix: 'session' });

/** Settings/config cache - standard TTL (5 minutes) */
export const settingsCache: CacheClient =
  globalForCache.__mediusSettingsCache ??
  createCacheClient({ ttl: 300, prefix: 'settings' });

/** Report data cache - longer TTL (10 minutes) */
export const reportCache: CacheClient =
  globalForCache.__mediusReportCache ??
  createCacheClient({ ttl: 600, prefix: 'report' });

/** General-purpose cache with default 5-minute TTL */
export const cache: CacheClient =
  globalForCache.__mediusDefaultCache ??
  createCacheClient({ ttl: 300, prefix: 'app' });

// Preserve singletons across hot reloads in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  globalForCache.__mediusDashboardCache = dashboardCache;
  globalForCache.__mediusSessionCache = sessionCache;
  globalForCache.__mediusSettingsCache = settingsCache;
  globalForCache.__mediusReportCache = reportCache;
  globalForCache.__mediusDefaultCache = cache;
}

// ─── Cache Decorator ──────────────────────────────────────────

/**
 * Cache decorator for async functions.
 * Returns cached value if present, otherwise calls fn(), caches the result, and returns it.
 *
 * @param key - Cache key
 * @param fn - Async function to call on cache miss
 * @param ttl - TTL in seconds (default: 300)
 * @param cacheInstance - Cache instance to use (default: general cache)
 *
 * @example
 *   const stats = await cached('dashboard:stats', fetchDashboardStats, 30);
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number,
  cacheInstance?: CacheClient,
): Promise<T> {
  const client = cacheInstance ?? cache;

  const existing = await client.get<T>(key);
  if (existing !== null) {
    return existing;
  }

  const value = await fn();
  await client.set(key, value, ttl);
  return value;
}

// ─── Exports ──────────────────────────────────────────────────

export { createCacheClient, InMemoryCache, RedisCache };
export type { CacheClient, CacheOptions };
