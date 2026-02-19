"""
Pre-compute embeddings for IS 456:2000 V2 chunks
"""

import sys
import json
import os
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Installing OpenAI...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
    from openai import OpenAI


def main():
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not set!")
        sys.exit(1)
    
    client = OpenAI(api_key=api_key)
    
    chunks_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_v2.json"
    output_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_v2_with_embeddings.json"
    
    print(f"\n{'='*60}")
    print("Pre-computing Embeddings for IS 456:2000 V2")
    print(f"{'='*60}\n")
    
    with open(chunks_file, 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks\n")
    print("🔄 Generating embeddings...")
    
    batch_size = 20
    total = len(chunks)
    
    for i in range(0, total, batch_size):
        batch = chunks[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total + batch_size - 1) // batch_size
        
        print(f"  Batch {batch_num}/{total_batches}...")
        
        for chunk in batch:
            if 'embedding' in chunk and chunk['embedding']:
                continue
            
            try:
                response = client.embeddings.create(
                    model='text-embedding-3-small',
                    input=chunk['content'][:8000]
                )
                chunk['embedding'] = response.data[0].embedding
            except Exception as e:
                print(f"    ⚠️  Error: {e}")
                chunk['embedding'] = None
    
    successful = sum(1 for c in chunks if c.get('embedding'))
    print(f"\n✅ Generated {successful}/{total} embeddings\n")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved to: {output_file}")
    print(f"✅ Done!")


if __name__ == "__main__":
    main()
