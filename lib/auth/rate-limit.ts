/**
 * Rate limiting with Upstash Redis (distributed) + in-memory fallback.
 * 
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 * uses distributed Redis-based rate limiting that persists across deploys.
 * 
 * Falls back to in-memory rate limiting when not configured (local dev, tests).
 */

import { getAuthRateLimiter, getGenericRateLimiter } from "@/lib/upstash/client";

// ============================================================================
// In-memory fallback (for local dev and tests)
// ============================================================================

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

// Run cleanup every 5 minutes (only active in non-serverless or long-running instances)
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupStaleEntries, 5 * 60 * 1000);
}

/**
 * In-memory rate limit check (fallback).
 */
function checkRateLimitInMemory(ip: string): { blocked: true; retryAfter: number } | null {
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record) {
        return null;
    }

    if (record.blockedUntil && now < record.blockedUntil) {
        const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
        return { blocked: true, retryAfter };
    }

    if (record.blockedUntil && now >= record.blockedUntil) {
        attempts.delete(ip);
        return null;
    }

    if (now - record.firstAttempt > WINDOW_MS) {
        attempts.delete(ip);
        return null;
    }

    return null;
}

// ============================================================================
// Exported functions (use Upstash when available, fallback to in-memory)
// ============================================================================

/**
 * Check if an IP is rate limited for authentication.
 * Uses Upstash Redis when configured, in-memory fallback otherwise.
 */
export async function checkRateLimit(ip: string): Promise<{ blocked: true; retryAfter: number } | null> {
    // Try Upstash first
    const limiter = getAuthRateLimiter();
    if (limiter) {
        try {
            const result = await limiter.limit(ip);
            if (!result.success) {
                const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
                return { blocked: true, retryAfter: Math.max(1, retryAfter) };
            }
            return null;
        } catch (e) {
            console.error("Upstash rate limit error, falling back to in-memory:", e);
            // Fall through to in-memory
        }
    }

    // Fall back to in-memory
    return checkRateLimitInMemory(ip);
}

/**
 * Record a failed authentication attempt.
 * Note: With Upstash, this is handled automatically by the limiter.
 * This function only affects in-memory fallback.
 */
export function recordFailedAttempt(ip: string): void {
    // Upstash handles this automatically via the limit() call
    // This only affects in-memory fallback
    const now = Date.now();
    const record = attempts.get(ip);

    if (!record) {
        attempts.set(ip, {
            count: 1,
            firstAttempt: now,
        });
        return;
    }

    if (now - record.firstAttempt > WINDOW_MS) {
        attempts.set(ip, {
            count: 1,
            firstAttempt: now,
        });
        return;
    }

    record.count++;

    if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = now + LOCKOUT_MS;
    }
}

/**
 * Clear rate limit record for an IP (e.g., after successful login).
 */
export function clearRateLimit(ip: string): void {
    attempts.delete(ip);
    // Note: Upstash rate limits will naturally expire
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

// ============================================================================
// Generic rate limiter (for invite endpoints, etc.)
// ============================================================================

interface GenericRateLimitRecord {
    count: number;
    windowStart: number;
}

const genericLimits = new Map<string, GenericRateLimitRecord>();

const GENERIC_WINDOW_MS = 60 * 1000; // 1 minute window
const GENERIC_MAX_REQUESTS = 10; // Max 10 requests per minute per IP

/**
 * In-memory generic rate limit check (fallback).
 */
function checkGenericRateLimitInMemory(
    ip: string,
    endpoint: string
): { blocked: true; retryAfter: number } | null {
    const key = `${endpoint}:${ip}`;
    const now = Date.now();
    const record = genericLimits.get(key);

    // Cleanup old entries occasionally
    if (Math.random() < 0.01) {
        for (const [k, v] of genericLimits.entries()) {
            if (now - v.windowStart > GENERIC_WINDOW_MS) {
                genericLimits.delete(k);
            }
        }
    }

    if (!record || now - record.windowStart > GENERIC_WINDOW_MS) {
        genericLimits.set(key, { count: 1, windowStart: now });
        return null;
    }

    if (record.count >= GENERIC_MAX_REQUESTS) {
        const retryAfter = Math.ceil((GENERIC_WINDOW_MS - (now - record.windowStart)) / 1000);
        return { blocked: true, retryAfter };
    }

    record.count++;
    return null;
}

/**
 * Check and record a request for generic rate limiting.
 * Uses Upstash Redis when configured, in-memory fallback otherwise.
 */
export async function checkGenericRateLimit(
    ip: string,
    endpoint: string
): Promise<{ blocked: true; retryAfter: number } | null> {
    // Try Upstash first
    const limiter = getGenericRateLimiter();
    if (limiter) {
        try {
            const result = await limiter.limit(`${endpoint}:${ip}`);
            if (!result.success) {
                const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
                return { blocked: true, retryAfter: Math.max(1, retryAfter) };
            }
            return null;
        } catch (e) {
            console.error("Upstash rate limit error, falling back to in-memory:", e);
            // Fall through to in-memory
        }
    }

    // Fall back to in-memory
    return checkGenericRateLimitInMemory(ip, endpoint);
}
