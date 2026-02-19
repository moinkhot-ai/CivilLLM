// ============================================
// CivilLLM - TypeScript Type Definitions
// ============================================

// ========== USER & AUTH ==========

export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN' | 'SUPERADMIN';
    preferredDomain?: string | null;
    createdAt: Date;
    lastLoginAt?: Date | null;
}

export interface Session {
    user: User;
    expires: string;
}

// ========== DOMAINS ==========

export type BotCategory = 'featured' | 'primary' | 'other';

export interface Domain {
    id: string;
    name: string;
    displayName: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    isActive: boolean;
    sortOrder: number;
    category: BotCategory;
}

// Featured Bots (Best is handled separately in UI)
export const FEATURED_DOMAINS: Domain[] = [
    {
        id: 'general',
        name: 'general',
        displayName: 'General',
        description: 'General civil engineering queries (MoE)',
        icon: 'general',
        color: '#3b82f6',
        isActive: true,
        sortOrder: 0,
        category: 'featured',
    },
];

// Primary Bots - Always visible
export const PRIMARY_DOMAINS: Domain[] = [
    {
        id: 'rcc',
        name: 'rcc',
        displayName: 'RCC Bot',
        description: 'Reinforced concrete design, IS 456 codes',
        icon: 'rcc',
        color: '#2563eb',
        isActive: true,
        sortOrder: 1,
        category: 'primary',
    },
    {
        id: 'steel',
        name: 'steel',
        displayName: 'Steel Bot',
        description: 'Structural steel design, IS 800 codes',
        icon: 'steel',
        color: '#64748b',
        isActive: true,
        sortOrder: 2,
        category: 'primary',
    },
    {
        id: 'site',
        name: 'site',
        displayName: 'Site Bot',
        description: 'Site execution, curing, quality control',
        icon: 'site',
        color: '#f97316',
        isActive: true,
        sortOrder: 3,
        category: 'primary',
    },
    {
        id: 'surveying',
        name: 'surveying',
        displayName: 'Surveying Bot',
        description: 'Land surveying, setting out, leveling',
        icon: 'surveying',
        color: '#22c55e',
        isActive: true,
        sortOrder: 4,
        category: 'primary',
    },
];

// Other Bots - Hidden by default, shown on "Show More"
export const OTHER_DOMAINS: Domain[] = [
    {
        id: 'geotechnical',
        name: 'geotechnical',
        displayName: 'Geotechnical Bot',
        description: 'Soil mechanics, foundations, earth works',
        icon: 'geotechnical',
        color: '#a16207',
        isActive: true,
        sortOrder: 5,
        category: 'other',
    },
    {
        id: 'masonry',
        name: 'masonry',
        displayName: 'Masonry Bot',
        description: 'Brick, block masonry, mortar mixes',
        icon: 'masonry',
        color: '#dc2626',
        isActive: true,
        sortOrder: 6,
        category: 'other',
    },
    {
        id: 'mep',
        name: 'mep',
        displayName: 'MEP Bot',
        description: 'Mechanical, Electrical, Plumbing systems',
        icon: 'mep',
        color: '#06b6d4',
        isActive: true,
        sortOrder: 7,
        category: 'other',
    },
    {
        id: 'roads',
        name: 'roads',
        displayName: 'Roads & Highways',
        description: 'Road design, pavement, IRC codes',
        icon: 'roads',
        color: '#d97706',
        isActive: true,
        sortOrder: 8,
        category: 'other',
    },
    {
        id: 'water',
        name: 'water',
        displayName: 'Water & Sanitation',
        description: 'Water supply, drainage, sewerage',
        icon: 'water',
        color: '#0d9488',
        isActive: true,
        sortOrder: 9,
        category: 'other',
    },
    {
        id: 'qs',
        name: 'qs',
        displayName: 'QS & Estimation',
        description: 'Quantity surveying, BOQ, costing',
        icon: 'qs',
        color: '#ec4899',
        isActive: true,
        sortOrder: 10,
        category: 'other',
    },
    {
        id: 'nbc',
        name: 'nbc',
        displayName: 'NBC Bot',
        description: 'National Building Code compliance',
        icon: 'nbc',
        color: '#10b981',
        isActive: true,
        sortOrder: 11,
        category: 'other',
    },
];

// All domains combined
export const DOMAINS: Domain[] = [...FEATURED_DOMAINS, ...PRIMARY_DOMAINS, ...OTHER_DOMAINS];

// ========== DOCUMENTS ==========

export interface Document {
    id: string;
    title: string;
    filename: string;
    fileUrl?: string | null;
    fileSize?: number | null;
    codeNumber?: string | null;
    version?: string | null;
    year?: number | null;
    jurisdiction?: string | null;
    status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
    chunkCount: number;
    indexedAt?: Date | null;
    domainId?: string | null;
    uploadedById?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ========== CHAT & MESSAGES ==========

export interface Conversation {
    id: string;
    title?: string | null;
    userId: string;
    domainId?: string | null;
    domain?: Domain | null;
    createdAt: Date;
    updatedAt: Date;
    messages?: Message[];
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    summary?: string | null;
    sources?: SourceCitation[] | null;
    confidence?: number | null;
    latencyMs?: number | null;
    modelUsed?: string | null;
    createdAt: Date;
}

export interface SourceCitation {
    docId: string;
    title: string;
    clause?: string | null;
    page?: number | null;
    excerpt: string;
    confidence?: number;
}

// ========== API CONTRACTS ==========

export interface ChatRequest {
    question: string;
    domainId: string;
    conversationId?: string;
}

export interface ChatResponse {
    answerId: string;
    conversationId: string;
    answer: string;
    summary: string;
    sources: SourceCitation[];
    confidence: number;
    latencyMs: number;
}

export interface FeedbackRequest {
    type: 'HELPFUL' | 'NOT_HELPFUL' | 'FLAG';
    comment?: string;
}

export interface SaveAnswerRequest {
    messageId: string;
    note?: string;
}

export interface DocumentUploadRequest {
    title: string;
    codeNumber?: string;
    version?: string;
    year?: number;
    jurisdiction?: string;
    domainId?: string;
}

// ========== UI STATE ==========

export interface UIState {
    selectedDomain: Domain;
    isSidebarOpen: boolean;
    isLoading: boolean;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
}

// ========== QUICK PROMPTS ==========

export interface QuickPrompt {
    id: string;
    text: string;
    domain?: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
    { id: '1', text: 'Minimum curing period for M25 concrete?', domain: 'site' },
    { id: '2', text: 'Cover requirements for slab reinforcement?', domain: 'rcc' },
    { id: '3', text: 'Lap length for 16mm bars?', domain: 'rcc' },
    { id: '4', text: 'Measurement rules for plastering?', domain: 'qs' },
    { id: '5', text: 'Permissible deflection for simply supported slab?', domain: 'rcc' },
    { id: '6', text: 'Fire resistance requirements as per NBC?', domain: 'nbc' },
    { id: '7', text: 'Bearing capacity calculation methods?', domain: 'geotechnical' },
    { id: '8', text: 'Steel beam section selection for given load?', domain: 'steel' },
];
