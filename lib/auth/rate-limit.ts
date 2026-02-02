/**
 * Simple in-memory rate limiter for authentication endpoints.
 * Tracks failed attempts by IP address and applies progressive delays.
 *
 * Note: This resets on server restart/redeploy. For production at scale,
 * consider Redis-based rate limiting.
 */

interface AttemptRecord {
    count: number;
    firstAttempt: number;
    blockedUntil?: number;
}

const attempts = new Map<string, AttemptRecord>();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max attempts before lockout
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout

/**
 * Clean up old entries periodically
 */
function cleanupStaleEntries() {
    const now = Date.now();
    for (const [key, record] of attempts.entries()) {
        if (now - record.firstAttempt > WINDOW_MS && !record.blockedUntil) {
            attempts.delete(key);
        } else if (record.blockedUntil && now > record.blockedUntil) {
            attempts.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupStaleEntries, 5 * 60 * 1000);

/**
 * Check if an IP is rate limited.
 * Returns null if allowed, or an error object if blocked.
 */
export function checkRateLimit(ip: string): { blocked: true; retryAfter: number } | null {
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record) {
        return null;
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
        const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
        return { blocked: true, retryAfter };
    }

    // Clear block if expired
    if (record.blockedUntil && now >= record.blockedUntil) {
        attempts.delete(ip);
        return null;
    }

    // Check if window expired
    if (now - record.firstAttempt > WINDOW_MS) {
        attempts.delete(ip);
        return null;
    }

    return null;
}

/**
 * Record a failed authentication attempt.
 */
export function recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record) {
        attempts.set(ip, {
            count: 1,
            firstAttempt: now,
        });
        return;
    }

    // Check if window expired
    if (now - record.firstAttempt > WINDOW_MS) {
        attempts.set(ip, {
            count: 1,
            firstAttempt: now,
        });
        return;
    }

    record.count++;

    // Apply lockout if threshold exceeded
    if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = now + LOCKOUT_MS;
    }
}

/**
 * Clear rate limit record for an IP (e.g., after successful login).
 */
export function clearRateLimit(ip: string): void {
    attempts.delete(ip);
}

/**
 * Get client IP from request headers.
 * Works with Vercel's forwarding headers.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }
    return "unknown";
}
