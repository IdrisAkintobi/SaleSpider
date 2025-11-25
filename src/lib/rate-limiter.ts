/**
 * Simple in-memory rate limiter for authentication endpoints
 * Tracks failed login attempts by IP address
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private readonly attempts: Map<string, RateLimitEntry> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number
  private readonly blockDurationMs: number

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 60 * 60 * 1000 // 1 hour
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if an IP is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const entry = this.attempts.get(identifier)
    if (!entry) return false

    const now = Date.now()
    if (now > entry.resetAt) {
      this.attempts.delete(identifier)
      return false
    }

    return entry.count >= this.maxAttempts
  }

  /**
   * Record a failed attempt
   */
  recordFailedAttempt(identifier: string): void {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry || now > entry.resetAt) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      })
    } else {
      // Increment count
      entry.count++

      // If max attempts reached, extend block duration
      if (entry.count >= this.maxAttempts) {
        entry.resetAt = now + this.blockDurationMs
      }
    }
  }

  /**
   * Clear attempts for an identifier (on successful login)
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Get remaining attempts before rate limit
   */
  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry) return this.maxAttempts

    const now = Date.now()
    if (now > entry.resetAt) {
      this.attempts.delete(identifier)
      return this.maxAttempts
    }

    return Math.max(0, this.maxAttempts - entry.count)
  }

  /**
   * Get time until rate limit resets (in seconds)
   */
  getResetTime(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry) return 0

    const now = Date.now()
    if (now > entry.resetAt) {
      this.attempts.delete(identifier)
      return 0
    }

    return Math.ceil((entry.resetAt - now) / 1000)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetAt) {
        this.attempts.delete(key)
      }
    }
  }

  /**
   * Get statistics (for monitoring)
   */
  getStats(): { totalEntries: number; blockedIPs: number } {
    const now = Date.now()
    let blockedIPs = 0

    for (const entry of this.attempts.values()) {
      if (entry.count >= this.maxAttempts && now <= entry.resetAt) {
        blockedIPs++
      }
    }

    return {
      totalEntries: this.attempts.size,
      blockedIPs,
    }
  }

  /**
   * Get list of blocked accounts with details (for admin)
   */
  getBlockedAccounts(): Array<{
    identifier: string
    attempts: number
    resetAt: number
    resetIn: number
  }> {
    const now = Date.now()
    const blocked: Array<{
      identifier: string
      attempts: number
      resetAt: number
      resetIn: number
    }> = []

    for (const [identifier, entry] of this.attempts.entries()) {
      if (entry.count >= this.maxAttempts && now <= entry.resetAt) {
        blocked.push({
          identifier,
          attempts: entry.count,
          resetAt: entry.resetAt,
          resetIn: Math.ceil((entry.resetAt - now) / 1000), // seconds
        })
      }
    }

    return blocked
  }
}

// Singleton instance - configurable via environment variables
export const loginRateLimiter = new RateLimiter(
  Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5, // Default: 5 attempts
  Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default: 15 minutes
  Number(process.env.RATE_LIMIT_BLOCK_MS) || 60 * 60 * 1000 // Default: 1 hour
)

/**
 * Helper to get client identifier from request
 * For store management apps, we use email/username instead of IP
 * since multiple employees may share the same network/IP
 */
export function getClientIdentifier(request: Request, email?: string): string {
  // Use email/username as identifier if provided (preferred for store apps)
  if (email) {
    return email.toLowerCase()
  }

  // Fallback to IP for cases where email isn't available yet
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Check if rate limiting is enabled via environment variable
 * Set RATE_LIMITING_ENABLED=false to disable for trusted networks
 */
export const isRateLimitingEnabled = (): boolean => {
  return process.env.RATE_LIMITING_ENABLED !== 'false'
}
