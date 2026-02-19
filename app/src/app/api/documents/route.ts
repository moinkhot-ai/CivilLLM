/**
 * Documents API Route
 * 
 * Handles document listing, upload, and deletion with rate limiting and validation.
 * Security-hardened following OWASP best practices.
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createRateLimiter, RATE_LIMITS } from '@/lib/security/rate-limit';
import {
    validateRequest,
    documentMetadataSchema,
    validateFile,
    sanitizeText
} from '@/lib/security/validation';
import { logSecurityEvent } from '@/lib/security/config';

// ============================================
// Rate Limiters
// ============================================

const listLimiter = createRateLimiter(RATE_LIMITS.DOCUMENTS.list);
const uploadLimiter = createRateLimiter({
    ...RATE_LIMITS.DOCUMENTS.upload,
    message: 'Upload limit reached. Please try again later.',
});

// ============================================
// Mock Storage (replace with database in production)
// ============================================

interface Document {
    id: string;
    title: string;
    filename: string;
    fileSize?: number;
    mimeType?: string;
    codeNumber?: string;
    version?: string;
    year?: number | null;
    jurisdiction?: string;
    status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
    chunkCount: number;
    domainId?: string;
    indexedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const documents: Map<string, Document> = new Map([
    ['is456-2000', {
        id: 'is456-2000',
        title: 'IS 456:2000 - Plain and Reinforced Concrete',
        filename: 'IS_456_2000.pdf',
        codeNumber: 'IS 456',
        version: '2000',
        year: 2000,
        jurisdiction: 'National',
        status: 'INDEXED',
        chunkCount: 245,
        domainId: 'rcc',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    }],
    ['is1200-1992', {
        id: 'is1200-1992',
        title: 'IS 1200:1992 - Method of Measurement',
        filename: 'IS_1200_1992.pdf',
        codeNumber: 'IS 1200',
        version: '1992',
        year: 1992,
        jurisdiction: 'National',
        status: 'INDEXED',
        chunkCount: 180,
        domainId: 'site',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    }],
    ['nbc-2016', {
        id: 'nbc-2016',
        title: 'National Building Code 2016',
        filename: 'NBC_2016.pdf',
        codeNumber: 'NBC',
        version: '2016',
        year: 2016,
        jurisdiction: 'National',
        status: 'INDEXED',
        chunkCount: 520,
        domainId: 'safety',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    }],
]);

// ============================================
// GET - List documents (with optional domain filter)
// ============================================

export async function GET(request: NextRequest) {
    try {
        // Apply rate limiting
        const rateLimitResponse = listLimiter(request);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/documents', method: 'GET' });
            return rateLimitResponse;
        }

        // Support ?domainId=rcc filtering
        const { searchParams } = new URL(request.url);
        const domainFilter = searchParams.get('domainId');

        let docs = Array.from(documents.values());

        if (domainFilter) {
            docs = docs.filter(d => d.domainId === domainFilter);
        }

        return NextResponse.json({ documents: docs });
    } catch (error) {
        console.error('Documents GET error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching documents' },
            { status: 500 }
        );
    }
}

// ============================================
// POST - Upload a new document
// ============================================

export async function POST(request: NextRequest) {
    try {
        // Apply strict rate limiting for uploads
        const rateLimitResponse = uploadLimiter(request);
        if (rateLimitResponse) {
            logSecurityEvent('rate_limit', { endpoint: '/api/documents', method: 'POST' });
            return rateLimitResponse;
        }

        // Parse multipart form data
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch {
            return NextResponse.json(
                { error: 'Invalid form data' },
                { status: 400 }
            );
        }

        // Get and validate file
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            );
        }

        const fileValidation = validateFile(file);
        if (!fileValidation.valid) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/documents',
                method: 'POST',
                error: fileValidation.error
            });
            return NextResponse.json(
                { error: fileValidation.error },
                { status: 400 }
            );
        }

        // Extract and validate metadata
        const metadata = {
            title: formData.get('title') as string,
            codeNumber: formData.get('codeNumber') as string | undefined,
            version: formData.get('version') as string | undefined,
            year: formData.get('year') as string | undefined,
            jurisdiction: formData.get('jurisdiction') as string | undefined,
            domainId: formData.get('domainId') as string | undefined,
        };

        const validation = validateRequest(documentMetadataSchema, metadata);
        if (!validation.success) {
            logSecurityEvent('validation_error', {
                endpoint: '/api/documents',
                method: 'POST',
                error: validation.error
            });
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const validatedMetadata = validation.data;
        const docId = uuidv4();

        // Sanitize filename to prevent path traversal
        const safeFilename = sanitizeText(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');

        const document: Document = {
            id: docId,
            title: validatedMetadata.title,
            filename: safeFilename,
            fileSize: file.size,
            mimeType: file.type,
            codeNumber: validatedMetadata.codeNumber,
            version: validatedMetadata.version,
            year: validatedMetadata.year ? parseInt(validatedMetadata.year) : null,
            jurisdiction: validatedMetadata.jurisdiction,
            status: 'PENDING',
            chunkCount: 0,
            domainId: validatedMetadata.domainId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        documents.set(docId, document);

        // Simulate processing delay and status update
        setTimeout(() => {
            const doc = documents.get(docId);
            if (doc) {
                doc.status = 'PROCESSING';
                documents.set(docId, doc);
            }
        }, 2000);

        setTimeout(() => {
            const doc = documents.get(docId);
            if (doc) {
                doc.status = 'INDEXED';
                doc.chunkCount = Math.floor(Math.random() * 200) + 50;
                doc.indexedAt = new Date().toISOString();
                documents.set(docId, doc);
            }
        }, 10000);

        return NextResponse.json({
            success: true,
            document,
            message: 'Document uploaded and queued for processing',
        });
    } catch (error) {
        console.error('Documents POST error:', error);
        return NextResponse.json(
            { error: 'An error occurred while uploading the document' },
            { status: 500 }
        );
    }
}

// ============================================
// DELETE - Remove a document
// ============================================

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const docId = searchParams.get('id');

        if (!docId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        const doc = documents.get(docId);
        if (!doc) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        documents.delete(docId);

        return NextResponse.json({
            success: true,
            message: `Document "${doc.title}" deleted successfully`,
        });
    } catch (error) {
        console.error('Documents DELETE error:', error);
        return NextResponse.json(
            { error: 'An error occurred while deleting the document' },
            { status: 500 }
        );
    }
}
