/**
 * Signup API Route
 * 
 * Handles user registration with rate limiting and input validation.
 * Security-hardened following OWASP best practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth'; // Removed registerDemoUser, getDemoUser
import { prisma } from '@/lib/prisma'; // Import prisma
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
        // ... (rate limiting and body parsing remains same)
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

        // Check if user already exists in DB
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            logSecurityEvent('auth_failure', {
                endpoint: '/api/auth/signup',
                reason: 'email_exists'
            });
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user in DB
        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                hashedPassword,
                role: 'USER', // Default role
            },
        });

        console.log('✅ User created:', email);

        return NextResponse.json({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
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
