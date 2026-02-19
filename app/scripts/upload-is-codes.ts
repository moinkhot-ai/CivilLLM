/**
 * Upload IS 456:2000 chunks to RCC Bot
 * Run: npx ts-node scripts/upload-is-codes.ts
 */

import { PrismaClient, IndexingStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
}

async function uploadIS456ToRCC() {
    console.log('\n' + '='.repeat(60));
    console.log('Uploading IS 456:2000 to RCC Bot');
    console.log('='.repeat(60) + '\n');

    try {
        // Load chunks
        const chunksPath = path.join('C:', 'Users', 'moink', 'Desktop', 'CivilLLM', 'documents', 'IS_456_2000_chunks.json');
        console.log(`📄 Loading chunks from: ${chunksPath}`);

        const chunksData = fs.readFileSync(chunksPath, 'utf-8');
        const chunks: ChunkData[] = JSON.parse(chunksData);

        console.log(`✅ Loaded ${chunks.length} chunks\n`);

        // Find or create RCC domain
        console.log('🔍 Finding RCC domain...');
        let rccDomain = await prisma.domain.findUnique({
            where: { id: 'rcc' }
        });

        if (!rccDomain) {
            console.log('Creating RCC domain...');
            rccDomain = await prisma.domain.create({
                data: {
                    id: 'rcc',
                    name: 'rcc',
                    displayName: 'RCC Bot',
                    description: 'Reinforced concrete design, IS 456 codes',
                    icon: 'rcc',
                    color: '#2563eb',
                    isActive: true,
                    sortOrder: 1
                }
            });
            console.log('✅ Created RCC domain\n');
        } else {
            console.log(`✅ Found RCC domain: ${rccDomain.displayName}\n`);
        }

        // Create document record
        console.log('📝 Creating document record...');
        const document = await prisma.document.create({
            data: {
                title: 'IS 456:2000 - Plain and Reinforced Concrete',
                filename: 'IS_456_2000.pdf',
                codeNumber: 'IS 456',
                version: '2000',
                year: 2000,
                jurisdiction: 'National',
                status: IndexingStatus.PROCESSING,
                chunkCount: chunks.length,
                domainId: rccDomain.id,
                mimeType: 'application/pdf'
            }
        });

        console.log(`✅ Created document: ${document.title}`);
        console.log(`   ID: ${document.id}\n`);

        // Upload chunks in batches
        console.log('📤 Uploading chunks to database...');
        const batchSize = 100;
        let uploaded = 0;

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);

            const chunkData = batch.map((chunk, idx) => ({
                documentId: document.id,
                content: chunk.content,
                chunkIndex: i + idx,
                pageNumber: chunk.pages && chunk.pages.length > 0 ? chunk.pages[0] : null,
                clauseNumber: chunk.clause,
                sectionTitle: chunk.title,
                tokenCount: Math.ceil(chunk.content.split(/\s+/).length), // Rough token estimate
            }));

            await prisma.chunk.createMany({
                data: chunkData
            });

            uploaded += batch.length;
            console.log(`   Uploaded ${uploaded}/${chunks.length} chunks...`);
        }

        console.log(`\n✅ Successfully uploaded all ${chunks.length} chunks!\n`);

        // Update document status
        console.log('✏️  Updating document status...');
        await prisma.document.update({
            where: { id: document.id },
            data: {
                status: IndexingStatus.INDEXED,
                indexedAt: new Date()
            }
        });

        console.log('✅ Document status: INDEXED\n');

        // Print summary
        console.log('='.repeat(60));
        console.log('📊 Upload Summary:');
        console.log(`   Document: ${document.title}`);
        console.log(`   Domain: RCC Bot`);
        console.log(`   Total chunks: ${chunks.length}`);
        console.log(`   Code: IS 456:2000`);
        console.log(`   Clauses: ${chunks.filter(c => c.clause).length}`);
        console.log(`   With tables: ${chunks.filter(c => c.has_tables).length}`);
        console.log('='.repeat(60));

        console.log('\n✅ IS 456:2000 is now available in RCC Bot!');
        console.log('🎯 Users can now query this code through the chat interface\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the upload
uploadIS456ToRCC()
    .then(() => {
        console.log('✅ Upload complete!');
        process.exit(0);
    })
    .catch((error) => console.error('Fatal error:', error);
process.exit(1);
  });
