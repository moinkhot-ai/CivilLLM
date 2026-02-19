/**
 * Security Configuration
 * 
 * Centralized security settings and environment variable validation.
 * OWASP Recommendation: Secure configuration management
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html
 */

// ============================================
// Environment Variable Validation
// ============================================

/**
 * Required environment variables for production security
 */
const REQUIRED_ENV_VARS = [
    'NEXTAUTH_SECRET',
] as const;

/**
 * Sensitive environment variables (logged as present/missing, not values)
 */
const SENSITIVE_ENV_VARS = [
    'OPENAI_API_KEY',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
] as const;

/**
 * Validate that required environment variables are set
 * Call this at application startup
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const varName of REQUIRED_ENV_VARS) {
        if (!process.env[varName]) {
            errors.push(`Missing required environment variable: ${varName}`);
        }
    }

    // Check sensitive variables (warn if missing, don't fail)
    for (const varName of SENSITIVE_ENV_VARS) {
        if (!process.env[varName]) {
            warnings.push(`Missing sensitive environment variable: ${varName}`);
        }
    }

    // Log warnings in development
    if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
        console.warn('[Security] Environment warnings:', warnings);
    }

    // Validate NEXTAUTH_SECRET strength
    const secret = process.env.NEXTAUTH_SECRET;
    if (secret && secret.length < 32) {
        errors.push('NEXTAUTH_SECRET should be at least 32 characters');
    }
    if (secret && secret.includes('your-') || secret?.includes('change-')) {
        errors.push('NEXTAUTH_SECRET appears to be a placeholder value');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Check if OpenAI API key is configured
 * Does NOT expose the key value
 */
export function isOpenAIConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.length > 0 && !key.startsWith('your-'));
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(
        clientId &&
        clientSecret &&
        !clientId.startsWith('your-') &&
        !clientSecret.startsWith('your-')
    );
}

// ============================================
// Security Headers
// ============================================

/**
 * Recommended security headers for API responses
 * These can be added via Next.js middleware or per-route
 */
export const SECURITY_HEADERS = {
    /** Prevent MIME type sniffing */
    'X-Content-Type-Options': 'nosniff',
    /** Prevent clickjacking */
    'X-Frame-Options': 'DENY',
    /** Enable XSS protection in older browsers */
    'X-XSS-Protection': '1; mode=block',
    /** Control referrer information */
    'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

// ============================================
// Rate Limit Configuration
// ============================================

/**
 * Get rate limit window from environment or use default
 */
export function getRateLimitWindow(): number {
    const envValue = process.env.RATE_LIMIT_WINDOW_MS;
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 60 * 1000; // Default: 1 minute
}

/**
 * Get max requests from environment or use default
 */
export function getRateLimitMaxRequests(): number {
    const envValue = process.env.RATE_LIMIT_MAX_REQUESTS;
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 100; // Default: 100 requests per window
}

// ============================================
// Logging Utilities (Security-Aware)
// ============================================

/**
 * Log a security event without exposing sensitive data
 */
export function logSecurityEvent(
    event: 'rate_limit' | 'validation_error' | 'auth_failure' | 'suspicious_request',
    details: Record<string, unknown>
): void {
    // Sanitize details to avoid logging sensitive info
    const safeDetails = { ...details };

    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const field of sensitiveFields) {
        if (field in safeDetails) {
            safeDetails[field] = '[REDACTED]';
        }
    }

    console.log(`[Security:${event}]`, JSON.stringify(safeDetails));
}
