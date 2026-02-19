/**
 * OpenAI Integration with RAG Support
 * 
 * Handles AI chat completions with proper error handling and RAG context injection.
 * Security: API key validation at startup, no key exposure.
 */

import OpenAI from 'openai';
import { isOpenAIConfigured } from '@/lib/security/config';
import { RAG_CONFIG } from '@/lib/rag/config';

// ============================================
// API Key Validation
// ============================================

// Validate at module load (will log warning if not configured)
if (!isOpenAIConfigured()) {
    console.warn(
        '[OpenAI] API key is not configured or appears to be a placeholder. ' +
        'Set OPENAI_API_KEY in your .env.local file.'
    );
}

// ============================================
// OpenAI Client
// ============================================

// Only create client if API key is present
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    : null;

// ============================================
// Chat Functions with RAG
// ============================================

export async function getChatResponse(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    domainContext?: string,
    domainId?: string
): Promise<{ content: string; model: string; citations?: string[] }> {
    // Check if OpenAI is configured
    if (!openai || !isOpenAIConfigured()) {
        throw new Error(
            'OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.'
        );
    }

    const userQuestion = messages[messages.length - 1]?.content || '';
    let ragContext: any = { retrievedChunks: [], contextText: '', citations: [] };

    // Only use RAG if enabled and domain supports it
    if (RAG_CONFIG.ENABLED && domainId && RAG_CONFIG.SUPPORTED_DOMAINS.includes(domainId)) {
        const { retrieveContext } = await import('@/lib/rag');
        console.log(`[RAG] Retrieving context for ${domainId} domain...`);
        ragContext = await retrieveContext(userQuestion, domainId, RAG_CONFIG.TOP_K);
        console.log(`[RAG] Found ${ragContext.citations.length} relevant sources`);
    }

    // Build system message
    let systemMessage: string;

    if (RAG_CONFIG.ENABLED && ragContext.contextText) {
        const { buildRAGPrompt } = await import('@/lib/rag');
        systemMessage = buildRAGPrompt(domainContext || '', ragContext);
    } else {
        // Standard prompt (no RAG)
        systemMessage = domainContext
            ? `You are CivilLLM, an expert AI assistant for civil engineering specializing in ${domainContext}.
               
Provide accurate, practical answers based on Indian Standard (IS) codes and engineering best practices.
- Cite specific clause numbers when you know them (e.g., "IS 456:2000, Clause 13.5")
- Use **bold**, bullet points, and clear formatting
- Keep answers actionable for field engineers
- If unsure about exact clause numbers, mention it clearly`
            : `You are CivilLLM, an expert AI assistant for civil engineering.
               Provide accurate answers based on Indian Standard (IS) codes and engineering best practices.`;
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemMessage },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        let content = response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

        // Add citations if RAG was used
        if (RAG_CONFIG.ENABLED && ragContext.citations.length > 0) {
            const { formatCitations } = await import('@/lib/rag');
            content += formatCitations(ragContext.citations);
        }

        return {
            content,
            model: 'gpt-4o-mini',
            citations: ragContext.citations
        };
    } catch (error) {
        console.error('OpenAI API error:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error('Failed to get AI response');
    }
}

export async function streamChatResponse(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    domainContext?: string
) {
    if (!openai || !isOpenAIConfigured()) {
        throw new Error(
            'OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.'
        );
    }

    const systemMessage = domainContext
        ? `You are CivilLLM, an expert AI assistant for civil engineering. You specialize in ${domainContext}. 
       Provide accurate, practical answers based on Indian Standard (IS) codes.`
        : `You are CivilLLM, an expert AI assistant for civil engineering.`;

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemMessage },
            ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
    });

    return stream;
}
