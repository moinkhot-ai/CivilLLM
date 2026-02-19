/**
 * Rate Limiting Utility
 * 
 * Implements sliding window rate limiting with IP and user-based throttling.
 * OWASP Recommendation: Protect against brute force and DoS attacks.
 * 
 * @see https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Types
// ============================================

interface RateLimitEntry {
    /** Timestamps of requests in the current window */
    timestamps: number[];
    /** When this entry was last accessed (for cleanup) */
    lastAccess: number;
}

interface RateLimitConfig {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum requests allowed in the window */
    maxRequests: number;
    /** Custom key generator (defaults to IP) */
    keyGenerator?: (req: NextRequest) => string;
    /** Message to send when rate limited */
    message?: string;
}

interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean;
    /** Remaining requests in current window */
    remaining: number;
    /** When the rate limit resets (Unix timestamp) */
    resetTime: number;
    /** Retry-After value in seconds */
    retryAfter: number;
}

// ============================================
// In-Memory Store
// ============================================

// Store for rate limit entries (keyed by IP or user ID)
const rateLimitStore: Map<string, RateLimitEntry> = new Map();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
// Entry expiry (entries not accessed for 10 minutes are removed)
const ENTRY_EXPIRY_MS = 10 * 60 * 1000;

// Periodic cleanup of stale entries
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        const entries = Array.from(rateLimitStore.entries());
        for (const [key, entry] of entries) {
            if (now - entry.lastAccess > ENTRY_EXPIRY_MS) {
                rateLimitStore.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);
}

// ============================================
// Core Rate Limiting Logic
// ============================================

/**
 * Check if a request should be rate limited
 */
function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
        entry = { timestamps: [], lastAccess: now };
        rateLimitStore.set(key, entry);
    }

    // Update last access time
    entry.lastAccess = now;

    // Filter timestamps to only those in current window (sliding window)
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    // Calculate remaining requests
    const remaining = Math.max(0, config.maxRequests - entry.timestamps.length);
    const allowed = entry.timestamps.length < config.maxRequests;

    // Calculate reset time (when oldest request in window expires)
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetTime = oldestTimestamp + config.windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    // If allowed, record this request
    if (allowed) {
        entry.timestamps.push(now);
    }

    return { allowed, remaining, resetTime, retryAfter };
}

/**
 * Get client IP address from request
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP)
 */
function getClientIP(req: NextRequest): string {
    // Check X-Forwarded-For header (common in proxies/load balancers)
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // X-Forwarded-For can be comma-separated list; first is original client
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        if (ips[0]) return ips[0];
    }

    // Check X-Real-IP header (used by nginx)
    const realIP = req.headers.get('x-real-ip');
    if (realIP) return realIP;

    // Fallback: use a hash of other identifying headers
    // In production with Next.js, you might use req.ip if available
    return 'unknown-ip';
}

// ============================================
// Preset Configurations
// ============================================

/** Standard rate limits for different endpoint types */
export const RATE_LIMITS = {
    /** Chat API - moderate limit, higher for authenticated users */
    CHAT: {
        anonymous: { windowMs: 60 * 1000, maxRequests: 5 },      // 5 req/min
        authenticated: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 req/min
    },
    /** Auth endpoints - strict limit to prevent brute force */
    AUTH: {
        signup: { windowMs: 60 * 1000, maxRequests: 5 },         // 5 req/min
        login: { windowMs: 60 * 1000, maxRequests: 10 },         // 10 req/min
    },
    /** Saved answers - lenient limit */
    SAVED: {
        anonymous: { windowMs: 60 * 1000, maxRequests: 10 },     // 10 req/min
        authenticated: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 req/min
    },
    /** Document upload - strict limit due to resource intensity */
    DOCUMENTS: {
        upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },   // 10 req/hour
        list: { windowMs: 60 * 1000, maxRequests: 60 },          // 60 req/min
    },
} as const;

// ============================================
// Middleware Factory
// ============================================

/**
 * Create a rate limiting middleware for an API route
 * 
 * @example
 * ```ts
 * const limiter = createRateLimiter(RATE_LIMITS.CHAT.anonymous);
 * 
 * export async function POST(req: NextRequest) {
 *     const rateLimitResponse = await limiter(req);
 *     if (rateLimitResponse) return rateLimitResponse;
 *     // ... rest of handler
 * }
 * ```
 */
export function createRateLimiter(config: Omit<RateLimitConfig, 'keyGenerator'> & { keyGenerator?: (req: NextRequest) => string }) {
    return function rateLimitMiddleware(req: NextRequest, userId?: string): NextResponse | null {
        // Generate key: prefer userId for authenticated users, else use IP
        const key = userId
            ? `user:${userId}`
            : config.keyGenerator
                ? config.keyGenerator(req)
                : `ip:${getClientIP(req)}`;

        const result = checkRateLimit(key, {
            windowMs: config.windowMs,
            maxRequests: config.maxRequests,
            message: config.message,
        });

        // If rate limited, return 429 Too Many Requests
        if (!result.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: config.message || 'You have exceeded the rate limit. Please try again later.',
                    retryAfter: result.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(result.retryAfter),
                        'X-RateLimit-Limit': String(config.maxRequests),
                        'X-RateLimit-Remaining': String(result.remaining),
                        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
                    },
                }
            );
        }

        // Request allowed - return null to continue
        return null;
    };
}

/**
 * Helper to get rate limiter for authenticated/anonymous based on user presence
 */
export function getRateLimiter(
    anonymousConfig: { windowMs: number; maxRequests: number },
    authenticatedConfig: { windowMs: number; maxRequests: number },
    userId?: string | null
) {
    const config = userId ? authenticatedConfig : anonymousConfig;
    return createRateLimiter(config);
}

// ============================================
// Utility Exports
// ============================================

export { getClientIP };
