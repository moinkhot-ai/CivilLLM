/**
 * RAG (Retrieval-Augmented Generation) Service
 * Retrieves relevant context and enhances prompts
 */

import { vectorStore, type SearchResult } from './vector-store';

interface RAGContext {
    retrievedChunks: SearchResult[];
    contextText: string;
    citations: string[];
}

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(
    query: string,
    domain: string,
    topK: number = 3
): Promise<RAGContext> {
    try {
        await vectorStore.loadChunks(domain);
        const results = await vectorStore.search(query, topK);

        if (results.length === 0) {
            return {
                retrievedChunks: [],
                contextText: '',
                citations: []
            };
        }

        const contextParts: string[] = [];
        const citations: string[] = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const { chunk, citation, similarity } = result;

            if (chunk.content && chunk.content.length > 50) {
                contextParts.push(
                    `[Source ${i + 1}: ${citation}]\n${chunk.content}\n`
                );
                citations.push(citation);
            }
        }

        const contextText = contextParts.join('\n---\n\n');

        console.log(`[RAG] Retrieved ${results.length} chunks (${citations.length} with content)`);

        return {
            retrievedChunks: results,
            contextText,
            citations
        };
    } catch (error) {
        console.error('[RAG] Context retrieval failed:', error);
        return {
            retrievedChunks: [],
            contextText: '',
            citations: []
        };
    }
}

/**
 * Build enhanced system prompt with RAG context
 */
export function buildRAGPrompt(
    domainContext: string,
    ragContext: RAGContext
): string {
    const basePrompt = `You are CivilLLM, an expert AI assistant for civil engineering specializing in ${domainContext}.`;

    if (!ragContext.contextText || ragContext.citations.length === 0) {
        return `${basePrompt}

RULES:
- Be concise. Don't over-explain.
- Answer ONLY what was asked.
- Mention the clause you're referring to.
- Use markdown formatting.`;
    }

    return `${basePrompt}

**IS CODE REFERENCE:**

${ragContext.contextText}

**RULES:**
1. Be concise. Don't over-explain.
2. Answer ONLY what was asked - nothing more.
3. Always mention the clause you're referring to (e.g., "As per Clause 13.5...")
4. Use the EXACT clause numbers from the sources above.
5. Use **bold** for key values and bullet points for lists.

**Sources:**
${ragContext.citations.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
}

/**
 * Format citations for response
 */
export function formatCitations(citations: string[]): string {
    if (citations.length === 0) return '';

    return `\n\n---\n**Ref:** ${citations.join(', ')}`;
}

export type { RAGContext };
