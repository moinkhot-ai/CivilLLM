"""
Upload IS Code chunks to RCC Bot RAG system
Requires: DATABASE_URL environment variable
"""

import sys
import json
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "Main App - AntiGravity"))

try:
    from prisma import Prisma
    import asyncio
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "prisma"])
    print("\nPlease run: prisma generate")
    print("Then run this script again.")
    sys.exit(1)


async def upload_chunks_to_rcc_bot(chunks_file: str, admin_email: str = None):
    """Upload processed chunks to the database for RCC bot"""
    
    # Load chunks
    print(f"\n{'='*60}")
    print("Loading chunks...")
    print(f"{'='*60}\n")
    
    with open(chunks_file, 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks from {chunks_file}\n")
    
    # Connect to database
    db = Prisma()
    await db.connect()
    print("✅ Connected to database\n")
    
    try:
        # Find RCC domain
        rcc_domain = await db.domain.find_first(
            where={'id': 'rcc'}
        )
        
        if not rcc_domain:
            print("❌ RCC domain not found in database!")
            print("Creating RCC domain...")
            
            rcc_domain = await db.domain.create(
                data={
                    'id': 'rcc',
                    'name': 'rcc',
                    'displayName': 'RCC Bot',
                    'description': 'Reinforced concrete design, IS 456 codes',
                    'icon': 'rcc',
                    'color': '#2563eb',
                    'isActive': True,
                    'sortOrder': 1
                }
            )
            print("✅ Created RCC domain\n")
        else:
            print(f"✅ Found RCC domain: {rcc_domain.displayName}\n")
        
        # Get admin user (optional)
        admin_user = None
        if admin_email:
            admin_user = await db.user.find_first(
                where={'email': admin_email}
            )
            if admin_user:
                print(f"✅ Found admin user: {admin_user.email}\n")
        
        # Create document record
        print("Creating document record...")
        
        document = await db.document.create(
            data={
                'title': 'IS 456:2000 - Plain and Reinforced Concrete',
                'filename': 'IS_456_2000.pdf',
                'codeNumber': 'IS 456',
                'version': '2000',
                'year': 2000,
                'jurisdiction': 'National',
                'status': 'PROCESSING',
                'chunkCount': len(chunks),
                'domainId': rcc_domain.id,
                'uploadedById': admin_user.id if admin_user else None,
                'mimeType': 'application/pdf'
            }
        )
        
        print(f"✅ Created document: {document.title} (ID: {document.id})\n")
        
        # Upload chunks in batches
        print("Uploading chunks to database...")
        batch_size = 50
        total_chunks = len(chunks)
        
        for i in range(0, total_chunks, batch_size):
            batch = chunks[i:i + batch_size]
            
            # Prepare chunk data
            chunk_data = []
            for idx, chunk in enumerate(batch):
                # Extract page numbers
                pages = chunk.get('pages', [])
                page_number = pages[0] if pages else None
                
                chunk_data.append({
                    'documentId': document.id,
                    'content': chunk['content'],
                    'chunkIndex': i + idx,
                    'pageNumber': page_number,
                    'clauseNumber': chunk.get('clause'),
                    'sectionTitle': chunk.get('title'),
                    'tokenCount': len(chunk['content'].split())  # Rough estimate
                })
            
            # Batch create
            await db.chunk.create_many(
                data=chunk_data
            )
            
            progress = min(i + batch_size, total_chunks)
            print(f"  Uploaded {progress}/{total_chunks} chunks...")
        
        print(f"\n✅ Uploaded all {total_chunks} chunks!\n")
        
        # Update document status
        await db.document.update(
            where={'id': document.id},
            data={
                'status': 'INDEXED',
                'indexedAt': datetime.utcnow()
            }
        )
        
        print("✅ Document status updated to INDEXED\n")
        
        # Statistics
        print(f"{'='*60}")
        print("📊 Upload Summary:")
        print(f"  Document: {document.title}")
        print(f"  Domain: RCC Bot")
        print(f"  Total chunks: {total_chunks}")
        print(f"  Code: {document.codeNumber}:{document.version}")
        print(f"  Pages covered: {len(set(c.get('pages', [None])[0] for c in chunks if c.get('pages')))}")
        print(f"{'='*60}\n")
        
        print("✅ IS 456:2000 successfully uploaded to RCC Bot!")
        print("🎯 Chunks are now available for RAG retrieval\n")
        
        # Note about embeddings
        print("⚠️  Next Step: Generate embeddings for semantic search")
        print("   Run: python scripts/generate_embeddings.py\n")
        
    finally:
        await db.disconnect()


if __name__ == "__main__":
    # Configuration
    chunks_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_chunks.json"
    admin_email = None  # Set to admin email if needed to link document to user
    
    # Check if chunks file exists
    if not Path(chunks_file).exists():
        print(f"❌ Chunks file not found: {chunks_file}")
        sys.exit(1)
    
    # Check DATABASE_URL
    if not os.getenv('DATABASE_URL'):
        print("❌ DATABASE_URL environment variable not set!")
        print("\nPlease set DATABASE_URL in .env.local file:")
        print("DATABASE_URL=postgresql://user:password@localhost:5432/civilllm")
        sys.exit(1)
    
    # Run upload
    asyncio.run(upload_chunks_to_rcc_bot(chunks_file, admin_email))
