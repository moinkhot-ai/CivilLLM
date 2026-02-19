/**
 * Signup API Route
 * 
 * Handles user registration with rate limiting and input validation.
 * Security-hardened following OWASP best practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, registerDemoUser, getDemoUser } from '@/lib/auth';
import { createRateLimiter, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateRequest, signupRequestSchema } from '@/lib/security/validation';
import { logSecurityEvent } from '@/lib/security/config';

// ============================================
// Rate Limiter
// ============================================

// Strict rate limiting for signup to prevent account enumeration and spam
const signupLimiter = createRateLimiter({
    ...RATE_LIMITS.AUTH.signup,
    message: 'Too many signup attempts. Please try again later.',
});

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting (always IP-based for signup since user doesn't exist yet)
        const rateLimitResponse = signupLimiter(request);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/auth/signup' });
            return rateLimitResponse;
        }

        // Parse request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate input using Zod schema
        const validation = validateRequest(signupRequestSchema, body);
        if (!validation.success) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/auth/signup',
                error: validation.error
            });
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        // Check if user already exists
        // Note: Use constant-time comparison in production to prevent timing attacks
        if (getDemoUser(email)) {
            // Don't reveal whether email exists (security best practice)
            // But for demo purposes, we provide helpful error
            logSecurityEvent('auth_failure', {
                endpoint: '/api/auth/signup',
                reason: 'email_exists'
            });
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password with bcrypt (cost factor 12)
        const hashedPassword = await hashPassword(password);

        // Create user (name is already sanitized by schema)
        const userId = registerDemoUser(
            email,
            name || email.split('@')[0],
            hashedPassword
        );

        console.log('Demo user created:', email);

        // Return success (don't include password hash!)
        return NextResponse.json({
            id: userId,
            email,
            name: name || email.split('@')[0],
            message: 'Account created! You can now log in.',
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'An error occurred during signup' },
            { status: 500 }
        );
    }
}
