/**
 * In-Memory Cache Layer for Medius AP Automation Platform
 *
 * Provides a robust in-memory caching solution with:
 * - TTL (time-to-live) support per entry
 * - LRU (least recently used) eviction when max capacity is reached
 * - Namespace support for logical grouping and bulk invalidation
 * - Pattern-based invalidation (e.g., "invoices:*")
 * - Cache statistics tracking (hits, misses, evictions)
 *
 * No external dependencies required. Works in both Node.js and Edge runtimes.
 */

// ─── Types ────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T
  expiresAt: number // Unix timestamp in ms
  lastAccessedAt: number
  key: string
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  evictions: number
}

interface CacheOptions {
  maxSize?: number
  defaultTtlMs?: number
}

// ─── Default TTLs by namespace ────────────────────────────────

const DEFAULT_NAMESPACE_TTLS: Record<string, number> = {
  dashboard: 30_000,   // 30 seconds
  session: 900_000,    // 15 minutes
  tenant: 300_000,     // 5 minutes
  report: 600_000,     // 10 minutes
  invoice: 120_000,    // 2 minutes
  user: 300_000,       // 5 minutes
  config: 600_000,     // 10 minutes
  feature: 300_000,    // 5 minutes
}

const DEFAULT_TTL_MS = 300_000 // 5 minutes
const DEFAULT_MAX_SIZE = 1000

// ─── NamespacedCache ──────────────────────────────────────────

class NamespacedCache {
  private manager: CacheManager
  private ns: string

  constructor(manager: CacheManager, ns: string) {
    this.manager = manager
    this.ns = ns
  }

  /**
   * Get a value from the cache within this namespace.
   */
  get<T>(key: string): T | null {
    return this.manager.get<T>(this.prefixedKey(key))
  }

  /**
   * Set a value in the cache within this namespace.
   * If ttlMs is not provided, uses the namespace default TTL.
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const effectiveTtl = ttlMs ?? DEFAULT_NAMESPACE_TTLS[this.ns] ?? DEFAULT_TTL_MS
    this.manager.set<T>(this.prefixedKey(key), value, effectiveTtl)
  }

  /**
   * Delete a specific key from this namespace.
   */
  del(key: string): void {
    this.manager.del(this.prefixedKey(key))
  }

  /**
   * Invalidate all entries in this namespace.
   */
  invalidateAll(): void {
    this.manager.invalidatePattern(`${this.ns}:*`)
  }

  /**
   * Invalidate entries matching a pattern within this namespace.
   */
  invalidatePattern(pattern: string): void {
    this.manager.invalidatePattern(`${this.ns}:${pattern}`)
  }

  private prefixedKey(key: string): string {
    return `${this.ns}:${key}`
  }
}

// ─── CacheManager ─────────────────────────────────────────────

class CacheManager {
  private store: Map<string, CacheEntry<unknown>>
  private maxSize: number
  private defaultTtlMs: number
  private hitCount: number
  private missCount: number
  private evictionCount: number
  private cleanupIntervalId: ReturnType<typeof setInterval> | null

  constructor(options?: CacheOptions) {
    this.store = new Map()
    this.maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE
    this.defaultTtlMs = options?.defaultTtlMs ?? DEFAULT_TTL_MS
    this.hitCount = 0
    this.missCount = 0
    this.evictionCount = 0
    this.cleanupIntervalId = null

    // Run periodic cleanup every 60 seconds to remove expired entries
    this.startCleanup()
  }

  /**
   * Retrieve a value from the cache.
   * Returns null if the key doesn't exist or has expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) {
      this.missCount++
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.missCount++
      return null
    }

    // Update last accessed time for LRU
    entry.lastAccessedAt = Date.now()
    this.hitCount++
    return entry.value as T
  }

  /**
   * Store a value in the cache with an optional TTL.
   * If the cache is at capacity, evicts the least recently used entry.
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const effectiveTtl = ttlMs ?? this.defaultTtlMs
    const now = Date.now()

    // If key already exists, update in place (no eviction needed)
    if (this.store.has(key)) {
      this.store.set(key, {
        value,
        expiresAt: now + effectiveTtl,
        lastAccessedAt: now,
        key,
      })
      return
    }

    // Evict if at capacity
    if (this.store.size >= this.maxSize) {
      this.evictLRU()
    }

    this.store.set(key, {
      value,
      expiresAt: now + effectiveTtl,
      lastAccessedAt: now,
      key,
    })
  }

  /**
   * Delete a specific key from the cache.
   */
  del(key: string): void {
    this.store.delete(key)
  }

  /**
   * Invalidate all cache entries whose keys match the given pattern.
   * Supports wildcard (*) matching:
   *   - "invoices:*"         matches all keys starting with "invoices:"
   *   - "*:tenant_001"       matches all keys ending with ":tenant_001"
   *   - "dashboard:*:stats"  matches keys like "dashboard:abc:stats"
   *   - "*"                  matches all keys (clears entire cache)
   */
  invalidatePattern(pattern: string): void {
    if (pattern === '*') {
      this.store.clear()
      return
    }

    const regex = this.patternToRegex(pattern)
    const keysToDelete: string[] = []

    this.store.forEach((_entry, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => {
      this.store.delete(key)
    })
  }

  /**
   * Create a namespaced cache instance for logical grouping.
   * The namespace is used as a key prefix and determines default TTL.
   */
  namespace(ns: string): NamespacedCache {
    return new NamespacedCache(this, ns)
  }

  /**
   * Get cache statistics: hits, misses, current size, and eviction count.
   */
  stats(): CacheStats {
    return {
      hits: this.hitCount,
      misses: this.missCount,
      size: this.store.size,
      evictions: this.evictionCount,
    }
  }

  /**
   * Clear all entries and reset statistics.
   */
  clear(): void {
    this.store.clear()
    this.hitCount = 0
    this.missCount = 0
    this.evictionCount = 0
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  /**
   * Get the remaining TTL in milliseconds for a key.
   * Returns -1 if the key doesn't exist or has expired.
   */
  ttl(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return -1
    const remaining = entry.expiresAt - Date.now()
    if (remaining <= 0) {
      this.store.delete(key)
      return -1
    }
    return remaining
  }

  /**
   * Get or set pattern: returns cached value if present,
   * otherwise calls the factory function, caches the result, and returns it.
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    this.set(key, value, ttlMs)
    return value
  }

  /**
   * Stop the periodic cleanup interval.
   * Call this during graceful shutdown.
   */
  destroy(): void {
    if (this.cleanupIntervalId !== null) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = null
    }
    this.store.clear()
  }

  // ─── Private methods ────────────────────────────────────────

  /**
   * Evict the least recently used entry from the cache.
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestAccess = Infinity
    let evictedExpired = false

    this.store.forEach((entry, key) => {
      if (evictedExpired) return

      // First, try to evict expired entries
      if (Date.now() > entry.expiresAt) {
        this.store.delete(key)
        this.evictionCount++
        evictedExpired = true
        return
      }

      if (entry.lastAccessedAt < oldestAccess) {
        oldestAccess = entry.lastAccessedAt
        oldestKey = key
      }
    })

    if (!evictedExpired && oldestKey !== null) {
      this.store.delete(oldestKey)
      this.evictionCount++
    }
  }

  /**
   * Convert a simple glob pattern to a RegExp.
   * Only supports * as wildcard (matches any characters).
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    const regexStr = escaped.replace(/\*/g, '.*')
    return new RegExp(`^${regexStr}$`)
  }

  /**
   * Periodically remove expired entries to prevent memory leaks.
   */
  private startCleanup(): void {
    // Use a try-catch to handle edge runtimes where setInterval may not be available
    try {
      this.cleanupIntervalId = setInterval(() => {
        this.removeExpired()
      }, 60_000) // Every 60 seconds

      // Prevent the interval from keeping the process alive in Node.js
      if (this.cleanupIntervalId && typeof this.cleanupIntervalId === 'object' && 'unref' in this.cleanupIntervalId) {
        (this.cleanupIntervalId as NodeJS.Timeout).unref()
      }
    } catch {
      // Silently ignore if setInterval is not available (Edge runtime)
      this.cleanupIntervalId = null
    }
  }

  /**
   * Remove all expired entries from the cache.
   */
  private removeExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => {
      this.store.delete(key)
    })
  }
}

// ─── Singleton Export ─────────────────────────────────────────

const globalForCache = globalThis as unknown as { __mediusCache: CacheManager }

export const cache: CacheManager =
  globalForCache.__mediusCache || new CacheManager()

if (process.env.NODE_ENV !== 'production') {
  globalForCache.__mediusCache = cache
}

export { CacheManager, NamespacedCache }
export type { CacheEntry, CacheStats, CacheOptions }
