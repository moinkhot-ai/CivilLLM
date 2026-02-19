/**
 * Input Validation & Sanitization Utility
 * 
 * Schema-based validation using Zod with XSS sanitization.
 * OWASP Recommendations: Input Validation, Output Encoding
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// ============================================
// Sanitization Utilities
// ============================================

/**
 * Sanitize text input to prevent XSS attacks
 * Strips all HTML tags and dangerous content
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Use DOMPurify to strip all HTML (ALLOWED_TAGS: [] means no tags allowed)
    const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });

    // Additional cleanup: normalize whitespace, trim
    return sanitized.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize text but preserve some formatting (newlines, basic whitespace)
 * Use for longer content like chat messages
 */
export function sanitizeTextPreserveFormatting(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Strip HTML but preserve newlines
    const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });

    // Normalize multiple newlines to max 2, trim
    return sanitized.trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * Sanitize and validate email format
 */
export function sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Lowercase, trim, remove any HTML
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).toLowerCase().trim();
}

// ============================================
// Common Zod Schemas
// ============================================

/**
 * Valid domain IDs for the application
 */
export const domainIdSchema = z.enum(['site', 'rcc', 'steel', 'surveying', 'geotechnical', 'masonry', 'mep', 'roads', 'water', 'qs', 'nbc', 'general', 'best', 'safety']).optional();

/**
 * Email validation schema
 * - Must be valid email format
 * - Max 254 characters (RFC 5321)
 * - Sanitized and lowercased
 */
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Invalid email format')
    .transform(sanitizeEmail);

/**
 * Password validation schema
 * - Min 8 characters (OWASP recommendation)
 * - Max 128 characters (prevent DoS via bcrypt)
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long');

/**
 * User name validation schema
 * - Optional, max 100 characters
 * - Sanitized
 */
export const nameSchema = z
    .string()
    .max(100, 'Name is too long')
    .transform(sanitizeText)
    .optional();

/**
 * Chat question validation schema
 * - Required, max 2000 characters
 * - Sanitized but preserves formatting
 */
export const questionSchema = z
    .string()
    .min(1, 'Question is required')
    .max(2000, 'Question is too long (max 2000 characters)')
    .transform(sanitizeTextPreserveFormatting);

/**
 * Chat message schema for conversation history
 */
export const messageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(10000, 'Message content is too long'),
}).strict();

/**
 * Conversation history validation schema
 * - Optional array of messages
 * - Max 20 messages to prevent context overflow
 */
export const conversationHistorySchema = z
    .array(messageSchema)
    .max(20, 'Conversation history is too long')
    .optional();

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Note/comment validation schema
 * - Optional, max 500 characters
 * - Sanitized
 */
export const noteSchema = z
    .string()
    .max(500, 'Note is too long (max 500 characters)')
    .transform(sanitizeTextPreserveFormatting)
    .optional();

/**
 * Content validation schema for saved answers
 * - Required, max 10000 characters
 */
export const contentSchema = z
    .string()
    .max(10000, 'Content is too long')
    .optional();

// ============================================
// API Request Schemas
// ============================================

/**
 * Chat API request schema
 */
export const chatRequestSchema = z.object({
    question: questionSchema,
    domainId: domainIdSchema,
    conversationHistory: conversationHistorySchema,
}).strict(); // Reject unexpected fields

/**
 * Signup request schema
 */
export const signupRequestSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
}).strict();

/**
 * Save answer request schema  
 */
export const saveAnswerRequestSchema = z.object({
    messageId: z.string().min(1, 'Message ID is required').max(100),
    note: noteSchema,
    content: contentSchema,
    sources: z.array(z.unknown()).optional(), // Flexible for now
}).strict();

/**
 * Document upload metadata schema
 */
export const documentMetadataSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long').transform(sanitizeText),
    codeNumber: z.string().max(50).transform(sanitizeText).optional(),
    version: z.string().max(20).transform(sanitizeText).optional(),
    year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
    jurisdiction: z.string().max(50).transform(sanitizeText).optional(),
    domainId: domainIdSchema,
}).strict();

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate request body against a schema
 * Returns parsed data or throws formatted error
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    details: z.ZodIssue[];
} {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Format error message from Zod issues
    const errorMessages = result.error.issues.map(issue => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
    });

    return {
        success: false,
        error: errorMessages.join('; '),
        details: result.error.issues,
    };
}

/**
 * File validation constants
 */
export const FILE_VALIDATION = {
    /** Allowed MIME types for document upload */
    ALLOWED_MIME_TYPES: ['application/pdf'] as const,
    /** Maximum file size in bytes (50MB) */
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    /** Maximum filename length */
    MAX_FILENAME_LENGTH: 255,
};

/**
 * Validate uploaded file
 */
export function validateFile(file: File): { valid: true } | { valid: false; error: string } {
    // Check file exists
    if (!file) {
        return { valid: false, error: 'File is required' };
    }

    // Check file size
    if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
        return { valid: false, error: `File is too large (max ${FILE_VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB)` };
    }

    // Check MIME type
    if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type as 'application/pdf')) {
        return { valid: false, error: 'Only PDF files are allowed' };
    }

    // Check filename length
    if (file.name.length > FILE_VALIDATION.MAX_FILENAME_LENGTH) {
        return { valid: false, error: 'Filename is too long' };
    }

    // Check for path traversal in filename
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        return { valid: false, error: 'Invalid filename' };
    }

    return { valid: true };
}
