/**
 * RAG Configuration
 */

export const RAG_CONFIG = {
    // ✅ ENABLED
    ENABLED: true,

    // Number of chunks to retrieve
    TOP_K: 5,

    // Lower threshold to get more matches
    MIN_SIMILARITY: 0.3,

    // Domains that support RAG
    SUPPORTED_DOMAINS: ['rcc', 'steel', 'general'],
};
