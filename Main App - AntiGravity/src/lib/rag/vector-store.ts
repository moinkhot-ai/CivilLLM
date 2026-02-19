/**
 * In-Memory Vector Search for RAG (with pre-computed embeddings)
 * Loads embeddings from file instead of generating on-the-fly
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ChunkData {
    id: string;
    code: string;
    clause: string | null;
    title: string | null;
    level: number;
    pages: number[];
    content: string;
    has_tables: boolean;
    table_count: number;
    char_count: number;
    embedding?: number[];
}

interface SearchResult {
    chunk: ChunkData;
    similarity: number;
    citation: string;
}

class VectorStore {
    private chunks: ChunkData[] = [];
    private isInitialized = false;

    /**
     * Load chunks with pre-computed embeddings from JSON file
     */
    async loadChunks(domain: string): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Load IS 456:2000 for RCC domain
            if (domain === 'rcc') {
                // Use V2 chunks with actual content (not TOC entries)
                const chunksPath = path.join(
                    process.cwd(), 'public', 'data', 'IS_456_2000_v2_with_embeddings.json'
                );

                // Check if pre-computed embeddings exist
                if (!fs.existsSync(chunksPath)) {
                    console.warn('[RAG] Pre-computed embeddings not found. RAG disabled.');
                    console.warn('[RAG] Run: python scripts/precompute_embeddings.py');
                    return;
                }

                const chunksData = fs.readFileSync(chunksPath, 'utf-8');
                this.chunks = JSON.parse(chunksData);

                const withEmbeddings = this.chunks.filter(c => c.embedding).length;
                console.log(`[RAG] Loaded ${this.chunks.length} chunks (${withEmbeddings} with embeddings)`);
                this.isInitialized = true;
            }
        } catch (error) {
            console.error('[RAG] Failed to load chunks:', error);
            this.chunks = [];
        }
    }

    /**
     * Get embedding for text using OpenAI
     */
    private async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text.substring(0, 8000),
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('[RAG] Embedding generation failed:', error);
            throw error;
        }
    }

    /**
     * Cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Search for relevant chunks (FAST - no embedding generation needed!)
     */
    async search(query: string, topK: number = 5, minSimilarity: number = 0.3): Promise<SearchResult[]> {
        if (this.chunks.length === 0) {
            console.log('[RAG] No chunks loaded');
            return [];
        }

        // Only generate embedding for the query (1 API call)
        const queryEmbedding = await this.getEmbedding(query);

        // Calculate similarities using PRE-COMPUTED embeddings
        const results: SearchResult[] = [];

        for (const chunk of this.chunks) {
            // Skip chunks without embeddings
            if (!chunk.embedding) continue;

            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);

            // Create citation
            const citation = chunk.clause
                ? `IS 456:2000, Clause ${chunk.clause}${chunk.title ? ` (${chunk.title})` : ''}`
                : `IS 456:2000, Page ${chunk.pages[0]}`;

            results.push({
                chunk,
                similarity,
                citation
            });
        }

        // Sort by similarity, take top K, then filter by threshold
        const topResults = results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

        // Debug: log top similarities
        if (topResults.length > 0) {
            console.log(`[RAG] Top similarities: ${topResults.slice(0, 3).map(r => r.similarity.toFixed(3)).join(', ')}`);
        }

        return topResults.filter(r => r.similarity > minSimilarity);
    }

    /**
     * Clear cache and reload
     */
    reset(): void {
        this.chunks = [];
        this.isInitialized = false;
    }
}

// Singleton instance
const vectorStore = new VectorStore();

export { vectorStore, type SearchResult };
