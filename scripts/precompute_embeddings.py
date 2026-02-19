"""
Pre-compute embeddings for IS Code chunks
Generates embeddings once and saves to file for fast loading
"""

import sys
import json
import os
from pathlib import Path
from typing import List, Dict

try:
    from openai import OpenAI
except ImportError:
    print("Installing OpenAI...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
    from openai import OpenAI


def precompute_embeddings(chunks_file: str, output_file: str):
    """Generate and save embeddings for all chunks"""
    
    # Check API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not set!")
        print("Set it in environment or .env.local file")
        sys.exit(1)
    
    client = OpenAI(api_key=api_key)
    
    print(f"\n{'='*60}")
    print("Pre-computing Embeddings")
    print(f"{'='*60}\n")
    
    # Load chunks
    print(f"📄 Loading chunks from: {chunks_file}")
    with open(chunks_file, 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks\n")
    
    # Generate embeddings in batches
    print("🔄 Generating embeddings...")
    batch_size = 50  # Process 50 at a time
    total = len(chunks)
    
    for i in range(0, total, batch_size):
        batch = chunks[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total + batch_size - 1) // batch_size
        
        print(f"  Batch {batch_num}/{total_batches} (chunks {i+1}-{min(i+batch_size, total)})...")
        
        for chunk in batch:
            # Skip if already has embedding
            if 'embedding' in chunk and chunk['embedding']:
                continue
            
            # Generate embedding
            try:
                response = client.embeddings.create(
                    model='text-embedding-3-small',
                    input=chunk['content'][:8000]  # Limit to 8k chars
                )
                chunk['embedding'] = response.data[0].embedding
            except Exception as e:
                print(f"    ⚠️  Error on chunk {chunk['id']}: {e}")
                chunk['embedding'] = None
    
    # Count successful embeddings
    successful = sum(1 for c in chunks if c.get('embedding'))
    print(f"\n✅ Generated {successful}/{total} embeddings\n")
    
    # Save to file
    print(f"💾 Saving to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    
    # Calculate file sizes
    original_size = os.path.getsize(chunks_file) / (1024 * 1024)
    new_size = os.path.getsize(output_file) / (1024 * 1024)
    
    print(f"\n📊 Summary:")
    print(f"  Original file: {original_size:.2f} MB")
    print(f"  With embeddings: {new_size:.2f} MB")
    print(f"  Chunks processed: {successful}/{total}")
    print(f"{'='*60}\n")
    
    print("✅ Pre-computation complete!")
    print("🎯 Embeddings are now ready for fast RAG retrieval\n")


if __name__ == "__main__":
    chunks_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_chunks.json"
    output_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_with_embeddings.json"
    
    if not Path(chunks_file).exists():
        print(f"❌ Chunks file not found: {chunks_file}")
        sys.exit(1)
    
    precompute_embeddings(chunks_file, output_file)
