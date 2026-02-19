/**
 * Saved Answers API Route
 * 
 * Handles saving, listing, and deleting saved answers.
 * Security-hardened with rate limiting and input validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createRateLimiter, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateRequest, saveAnswerRequestSchema, uuidSchema } from '@/lib/security/validation';
import { logSecurityEvent } from '@/lib/security/config';

// ============================================
// Rate Limiters
// ============================================

const anonymousLimiter = createRateLimiter(RATE_LIMITS.SAVED.anonymous);
const authenticatedLimiter = createRateLimiter(RATE_LIMITS.SAVED.authenticated);

// ============================================
// Mock Storage (replace with database in production)
// ============================================

interface SavedAnswer {
    id: string;
    messageId: string;
    note?: string;
    content?: string;
    sources?: unknown[];
    savedAt: string;
}

const savedAnswers: Map<string, SavedAnswer> = new Map();

// ============================================
// GET - List saved answers
// ============================================

export async function GET(request: NextRequest) {
    try {
        // TODO: Get user ID from session
        const userId = null;

        // Apply rate limiting
        const limiter = userId ? authenticatedLimiter : anonymousLimiter;
        const rateLimitResponse = limiter(request, userId || undefined);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/saved', method: 'GET' });
            return rateLimitResponse;
        }

        const answers = Array.from(savedAnswers.values());
        return NextResponse.json({ answers });
    } catch (error) {
        console.error('Saved answers GET error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching saved answers' },
            { status: 500 }
        );
    }
}

// ============================================
// POST - Save an answer
// ============================================

export async function POST(request: NextRequest) {
    try {
        // TODO: Get user ID from session
        const userId = null;

        // Apply rate limiting
        const limiter = userId ? authenticatedLimiter : anonymousLimiter;
        const rateLimitResponse = limiter(request, userId || undefined);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/saved', method: 'POST' });
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

        // Validate input
        const validation = validateRequest(saveAnswerRequestSchema, body);
        if (!validation.success) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/saved',
                method: 'POST',
                error: validation.error
            });
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { messageId, note, content, sources } = validation.data;

        const savedAnswer: SavedAnswer = {
            id: uuidv4(),
            messageId,
            note,
            content,
            sources,
            savedAt: new Date().toISOString(),
        };

        savedAnswers.set(savedAnswer.id, savedAnswer);

        return NextResponse.json({
            success: true,
            savedAnswer,
        });
    } catch (error) {
        console.error('Saved answers POST error:', error);
        return NextResponse.json(
            { error: 'An error occurred while saving the answer' },
            { status: 500 }
        );
    }
}

// ============================================
// DELETE - Remove a saved answer
// ============================================

export async function DELETE(request: NextRequest) {
    try {
        // TODO: Get user ID from session
        const userId = null;

        // Apply rate limiting
        const limiter = userId ? authenticatedLimiter : anonymousLimiter;
        const rateLimitResponse = limiter(request, userId || undefined);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/saved', method: 'DELETE' });
            return rateLimitResponse;
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Validate ID parameter
        if (!id) {
            return NextResponse.json(
                { error: 'Answer ID is required' },
                { status: 400 }
            );
        }

        // Validate ID format (should be valid string, protect against injection)
        const idValidation = uuidSchema.safeParse(id);
        if (!idValidation.success) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/saved',
                method: 'DELETE',
                error: 'Invalid ID format'
            });
            return NextResponse.json(
                { error: 'Invalid answer ID format' },
                { status: 400 }
            );
        }

        savedAnswers.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Answer removed from saved',
        });
    } catch (error) {
        console.error('Saved answers DELETE error:', error);
        return NextResponse.json(
            { error: 'An error occurred while removing the saved answer' },
            { status: 500 }
        );
    }
}
