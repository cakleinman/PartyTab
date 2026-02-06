import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Upstash Redis client for distributed rate limiting.
 * 
 * Graceful degradation: Returns null when not configured,
 * allowing fallback to in-memory rate limiting for local dev.
 */

// Lazy initialization - only connect when needed
let redis: Redis | null = null;

/**
 * Get Redis client instance (singleton).
 * Returns null if Upstash environment variables are not set.
 */
export function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redis;
}

/**
 * Rate limiter for authentication endpoints.
 * 5 attempts per 15 minutes per IP.
 */
export function getAuthRateLimiter(): Ratelimit | null {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "ratelimit:auth",
    });
}

/**
 * Rate limiter for generic endpoints (invites, etc).
 * 10 requests per minute per IP.
 */
export function getGenericRateLimiter(): Ratelimit | null {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "ratelimit:generic",
    });
}
