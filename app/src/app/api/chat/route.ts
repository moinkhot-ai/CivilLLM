/**
 * Chat API Route
 * 
 * Handles AI chat requests with rate limiting and input validation.
 * Security-hardened following OWASP best practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/openai';
import { createRateLimiter, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateRequest, chatRequestSchema } from '@/lib/security/validation';
import { logSecurityEvent, isOpenAIConfigured } from '@/lib/security/config';

// ============================================
// Rate Limiters
// ============================================

// Rate limiter for anonymous users (stricter)
const anonymousLimiter = createRateLimiter(RATE_LIMITS.CHAT.anonymous);
// Rate limiter for authenticated users (more lenient)
const authenticatedLimiter = createRateLimiter(RATE_LIMITS.CHAT.authenticated);

// ============================================
// Domain Context Mapping
// ============================================

const DOMAIN_CONTEXTS: Record<string, string> = {
    // Featured
    general: 'General civil engineering queries and IS code guidance',
    best: 'General civil engineering across all domains — auto-selects the best expert',
    // Primary
    rcc: 'RCC (Reinforced Cement Concrete) design, IS 456:2000 codes, structural analysis, beam/column/slab design',
    steel: 'Structural steel design, IS 800:2007 codes, connections, fabrication, and erection',
    site: 'Site engineering, site execution, curing, concreting, quality control on site',
    surveying: 'Land surveying, setting out, leveling, theodolite, total station, GPS, contour mapping',
    // Specialty
    geotechnical: 'Geotechnical engineering, soil mechanics, foundation design, bearing capacity, pile foundations',
    masonry: 'Brick and block masonry, mortar mixes, pointing, plastering, IS 1905 codes',
    mep: 'Mechanical, Electrical, and Plumbing systems in buildings — HVAC, drainage, sanitary, wiring',
    roads: 'Road and highway design, pavement design, IRC codes, bitumen, asphalt, camber, drainage',
    water: 'Water supply, sewage, sewerage systems, STP, WTP, overhead tanks, pipeline design',
    qs: 'Quantity surveying, BOQ preparation, estimation, costing, measurement, tender documents',
    nbc: 'National Building Code compliance, fire safety, PPE, hazard management, building regulations',
    // Legacy
    safety: 'Construction safety, NBC 2016, fire safety, and compliance',
};

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
    try {
        // Check if OpenAI is configured
        if (!isOpenAIConfigured()) {
            return NextResponse.json(
                { error: 'AI service is not configured. Please contact support.' },
                { status: 503 }
            );
        }

        // TODO: Get user ID from session for authenticated rate limiting
        // For now, using IP-based rate limiting for all requests
        const userId = null; // Replace with: await getServerSession().then(s => s?.user?.id)

        // Apply rate limiting
        const limiter = userId ? authenticatedLimiter : anonymousLimiter;
        const rateLimitResponse = limiter(request, userId || undefined);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/chat', userId });
            return rateLimitResponse;
        }

        // Parse and validate request body
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
        const validation = validateRequest(chatRequestSchema, body);
        if (!validation.success) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/chat',
                error: validation.error
            });
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error },
                { status: 400 }
            );
        }

        const { question, domainId, conversationHistory } = validation.data;
        const startTime = Date.now();
        const domainContext = DOMAIN_CONTEXTS[domainId || 'site'] || DOMAIN_CONTEXTS.site;

        // Build message history (already validated by schema)
        const messages: { role: 'user' | 'assistant'; content: string }[] = [];

        if (conversationHistory && Array.isArray(conversationHistory)) {
            // Keep last 6 messages for context (already limited by schema to 20)
            for (const msg of conversationHistory.slice(-6)) {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
        }

        messages.push({ role: 'user', content: question });

        // Get AI response with RAG
        const response = await getChatResponse(messages, domainContext, domainId || 'site');
        const latencyMs = Date.now() - startTime;

        return NextResponse.json({
            answer: response.content,
            model: response.model,
            latencyMs,
            domainId: domainId || 'site',
            citations: response.citations || [],
        });
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : '';
        console.error('Chat API error:', errMsg);
        console.error('Stack:', errStack);
        return NextResponse.json(
            { error: 'Failed to get AI response. Please try again.', detail: errMsg },
            { status: 500 }
        );
    }
}
