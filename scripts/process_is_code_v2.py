"""
IS Code PDF Processor v2
Extracts FULL clause content, not just TOC entries
"""

import sys
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber


class ISCodeProcessorV2:
    def __init__(self, pdf_path: str, code_number: str = "IS 456:2000"):
        self.pdf_path = pdf_path
        self.code_number = code_number
        self.chunks = []
        
    def extract_all_text(self) -> str:
        """Extract all text from PDF as one continuous string"""
        full_text = []
        
        with pdfplumber.open(self.pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"📄 Extracting text from {total_pages} pages...\n")
            
            # Skip first 3 pages (cover, disclaimer, title)
            for i, page in enumerate(pdf.pages[3:], start=4):
                if i % 20 == 0:
                    print(f"  Page {i}/{total_pages}...")
                
                text = page.extract_text()
                if text:
                    # Add page marker
                    full_text.append(f"\n[PAGE {i}]\n")
                    full_text.append(text)
        
        combined = '\n'.join(full_text)
        print(f"✅ Extracted {len(combined):,} characters\n")
        return combined
    
    def detect_clause(self, line: str) -> Tuple[str, str, int]:
        """Detect if a line is a clause heading. Returns (clause_num, title, level) or None"""
        line = line.strip()
        
        # Pattern: "26.4.2.1 Nominal Cover to Meet Durability Requirements"
        # Matches: 1.2, 26.4, 26.4.2, 26.4.2.1
        match = re.match(r'^(\d+(?:\.\d+){0,3})\s+([A-Z][^0-9\n]{3,})$', line)
        if match:
            clause_num = match.group(1)
            title = match.group(2).strip()
            level = len(clause_num.split('.'))
            return (clause_num, title, level)
        
        # Pattern: "SECTION 1 GENERAL"
        match = re.match(r'^(SECTION\s+\d+)\s+(.+)$', line)
        if match:
            return (match.group(1), match.group(2).strip(), 0)
        
        # Pattern: "ANNEX A" or "ANNEX B-1"
        match = re.match(r'^(ANNEX\s+[A-Z](?:-\d+)?)\s*(.*)$', line)
        if match:
            return (match.group(1), match.group(2).strip() or "Annex", 0)
        
        return None
    
    def chunk_by_content(self, full_text: str) -> List[Dict[str, Any]]:
        """Create chunks with FULL content between clause headings"""
        lines = full_text.split('\n')
        chunks = []
        
        current_clause = None
        current_title = None
        current_level = 0
        current_content = []
        current_pages = set()
        current_page = 0
        
        for line in lines:
            # Track page numbers
            page_match = re.match(r'\[PAGE (\d+)\]', line)
            if page_match:
                current_page = int(page_match.group(1))
                continue
            
            # Skip empty lines at chunk start
            if not current_content and not line.strip():
                continue
            
            # Check for new clause
            clause_info = self.detect_clause(line)
            
            if clause_info:
                # Save previous chunk if it has content
                if current_content and len(''.join(current_content)) > 50:
                    chunks.append(self._create_chunk(
                        current_clause, 
                        current_title,
                        current_level,
                        current_content,
                        list(current_pages)
                    ))
                
                # Start new chunk
                current_clause, current_title, current_level = clause_info
                current_content = [line]
                current_pages = {current_page}
            else:
                # Accumulate content
                current_content.append(line)
                if current_page:
                    current_pages.add(current_page)
        
        # Add final chunk
        if current_content and len(''.join(current_content)) > 50:
            chunks.append(self._create_chunk(
                current_clause,
                current_title, 
                current_level,
                current_content,
                list(current_pages)
            ))
        
        print(f"✅ Created {len(chunks)} content-rich chunks\n")
        return chunks
    
    def _create_chunk(self, clause: str, title: str, level: int, 
                      content: List[str], pages: List[int]) -> Dict:
        """Create a chunk dictionary"""
        text = '\n'.join(content)
        
        # Clean up text
        text = re.sub(r'\n{3,}', '\n\n', text)  # Remove excess newlines
        text = text.strip()
        
        chunk_id = f"{self.code_number}_{clause or 'intro'}".replace(' ', '_').replace(':', '_')
        
        return {
            'id': chunk_id,
            'code': self.code_number,
            'clause': clause,
            'title': title,
            'level': level,
            'pages': sorted(pages),
            'content': text,
            'char_count': len(text),
            'word_count': len(text.split())
        }
    
    def split_large_chunks(self, chunks: List[Dict], max_words: int = 500) -> List[Dict]:
        """Split chunks that are too large for embedding"""
        final_chunks = []
        
        for chunk in chunks:
            if chunk['word_count'] <= max_words:
                final_chunks.append(chunk)
            else:
                # Split into smaller parts
                words = chunk['content'].split()
                parts = []
                current = []
                
                for word in words:
                    current.append(word)
                    if len(current) >= max_words:
                        parts.append(' '.join(current))
                        current = []
                
                if current:
                    parts.append(' '.join(current))
                
                # Create sub-chunks
                for i, part in enumerate(parts):
                    sub_chunk = chunk.copy()
                    sub_chunk['id'] = f"{chunk['id']}_part{i+1}"
                    sub_chunk['content'] = part
                    sub_chunk['char_count'] = len(part)
                    sub_chunk['word_count'] = len(part.split())
                    sub_chunk['part'] = f"{i+1}/{len(parts)}"
                    final_chunks.append(sub_chunk)
        
        return final_chunks
    
    def process(self) -> List[Dict]:
        """Main processing pipeline"""
        print(f"\n{'='*60}")
        print(f"Processing IS Code (V2 - Full Content)")
        print(f"Code: {self.code_number}")
        print(f"File: {self.pdf_path}")
        print(f"{'='*60}\n")
        
        # Step 1: Extract all text
        full_text = self.extract_all_text()
        
        # Step 2: Chunk by clause (with full content)
        chunks = self.chunk_by_content(full_text)
        
        # Step 3: Split large chunks
        chunks = self.split_large_chunks(chunks, max_words=500)
        
        # Stats
        total_chars = sum(c['char_count'] for c in chunks)
        avg_words = sum(c['word_count'] for c in chunks) // len(chunks)
        
        print(f"📊 Processing Summary:")
        print(f"  Total chunks: {len(chunks)}")
        print(f"  Total characters: {total_chars:,}")
        print(f"  Average words/chunk: {avg_words}")
        print(f"  Chunks with clauses: {sum(1 for c in chunks if c['clause'])}")
        print(f"{'='*60}\n")
        
        self.chunks = chunks
        return chunks
    
    def save(self, output_path: str):
        """Save chunks to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.chunks, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved {len(self.chunks)} chunks to: {output_path}\n")
        
        # Show samples
        print("📋 Sample chunks:\n")
        for chunk in self.chunks[:3]:
            print(f"  [{chunk['clause']}] {chunk['title']}")
            print(f"  Pages: {chunk['pages']}, Words: {chunk['word_count']}")
            print(f"  Preview: {chunk['content'][:150]}...")
            print()


if __name__ == "__main__":
    pdf_path = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000.pdf"
    output_path = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_v2.json"
    
    if not Path(pdf_path).exists():
        print(f"❌ PDF not found: {pdf_path}")
        sys.exit(1)
    
    processor = ISCodeProcessorV2(pdf_path, "IS 456:2000")
    processor.process()
    processor.save(output_path)
    
    print("🎯 Next step: Run precompute_embeddings.py on the new file")
    print(f"   python precompute_embeddings.py --input {output_path}")
