"""
IS Code to RAG Processor
Converts IS codes into structured, embedding-ready chunks for RAG
"""

import sys
import json
import re
from pathlib import Path
from typing import List, Dict, Any

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber


class ISCodeProcessor:
    def __init__(self, pdf_path: str, code_number: str = "IS 456:2000"):
        self.pdf_path = pdf_path
        self.code_number = code_number
        self.chunks = []
        
    def extract_full_text(self) -> List[Dict[str, Any]]:
        """Extract text from all pages with metadata"""
        pages_data = []
        
        with pdfplumber.open(self.pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"📄 Processing {total_pages} pages...\n")
            
            for i, page in enumerate(pdf.pages):
                page_num = i + 1
                if page_num % 10 == 0:
                    print(f"  Processed {page_num}/{total_pages} pages...")
                
                text = page.extract_text()
                tables = page.extract_tables()
                
                pages_data.append({
                    'page_num': page_num,
                    'text': text if text else '',
                    'tables': tables if tables else [],
                    'has_tables': len(tables) > 0 if tables else False
                })
        
        print(f"✅ Extracted {len(pages_data)} pages\n")
        return pages_data
    
    def detect_clause_structure(self, text: str) -> Dict[str, Any]:
        """Detect clause numbers and hierarchy (e.g., 6.2.1, 26.4.2.2)"""
        # Match patterns like: "23.2.1", "6.1", "SECTION 3", etc.
        patterns = [
            r'^(\d+\.[\d\.]+)\s+(.+)$',  # Numbered clauses: 23.2.1 Title
            r'^(SECTION\s+\d+)\s+(.+)$',  # SECTION 1 TITLE
            r'^([A-Z\-]+\s+\d+\.[\d\.]*)\s+(.+)$',  # ANNEX-A 1.2
        ]
        
        for pattern in patterns:
            match = re.match(pattern, text.strip(), re.MULTILINE)
            if match:
                return {
                    'clause_num': match.group(1),
                    'title': match.group(2),
                    'level': len(match.group(1).split('.')) if '.' in match.group(1) else 1
                }
        
        return None
    
    def chunk_by_clause(self, pages_data: List[Dict]) -> List[Dict[str, Any]]:
        """Chunk content by clause/section for optimal RAG retrieval"""
        chunks = []
        current_chunk = {
            'clause': None,
            'title': None,
            'content': [],
            'pages': [],
            'tables': [],
            'code': self.code_number
        }
        
        for page_data in pages_data:
            page_num = page_data['page_num']
            text = page_data['text']
            
            if not text:
                continue
            
            lines = text.split('\n')
            
            for line in lines:
                # Check if this line is a new clause
                clause_info = self.detect_clause_structure(line)
                
                if clause_info and len(current_chunk['content']) > 0:
                    # Save previous chunk
                    chunks.append(self._finalize_chunk(current_chunk))
                    
                    # Start new chunk
                    current_chunk = {
                        'clause': clause_info['clause_num'],
                        'title': clause_info['title'],
                        'content': [line],
                        'pages': [page_num],
                        'tables': [],
                        'code': self.code_number,
                        'level': clause_info['level']
                    }
                elif clause_info:
                    # First clause
                    current_chunk['clause'] = clause_info['clause_num']
                    current_chunk['title'] = clause_info['title']
                    current_chunk['level'] = clause_info['level']
                    current_chunk['content'].append(line)
                    current_chunk['pages'].append(page_num)
                else:
                    # Continue current chunk
                    current_chunk['content'].append(line)
                    if page_num not in current_chunk['pages']:
                        current_chunk['pages'].append(page_num)
            
            # Add tables
            if page_data['has_tables']:
                for table in page_data['tables']:
                    current_chunk['tables'].append({
                        'page': page_num,
                        'data': table
                    })
        
        # Add last chunk
        if current_chunk['content']:
            chunks.append(self._finalize_chunk(current_chunk))
        
        print(f"✅ Created {len(chunks)} semantic chunks\n")
        return chunks
    
    def _finalize_chunk(self, chunk: Dict) -> Dict:
        """Finalize chunk with clean text and metadata"""
        text_content = '\n'.join(chunk['content'])
        
        # Format tables as markdown
        table_text = ""
        if chunk['tables']:
            for i, table_data in enumerate(chunk['tables']):
                table_text += f"\n\n[Table on page {table_data['page']}]\n"
                for row in table_data['data']:
                    table_text += '| ' + ' | '.join([str(cell) if cell else '' for cell in row]) + ' |\n'
        
        return {
            'id': f"{self.code_number}_{chunk.get('clause', 'unknown')}".replace(' ', '_').replace(':', '_'),
            'code': self.code_number,
            'clause': chunk.get('clause'),
            'title': chunk.get('title'),
            'level': chunk.get('level', 0),
            'pages': chunk['pages'],
            'content': text_content + table_text,
            'has_tables': len(chunk['tables']) > 0,
            'table_count': len(chunk['tables']),
            'char_count': len(text_content + table_text)
        }
    
    def process(self) -> List[Dict]:
        """Main processing pipeline"""
        print(f"\n{'='*60}")
        print(f"Processing: {self.code_number}")
        print(f"File: {self.pdf_path}")
        print(f"{'='*60}\n")
        
        # Extract all pages
        pages_data = self.extract_full_text()
        
        # Chunk by clause
        chunks = self.chunk_by_clause(pages_data)
        
        # Statistics
        total_chars = sum(c['char_count'] for c in chunks)
        chunks_with_tables = sum(1 for c in chunks if c['has_tables'])
        
        print(f"📊 Processing Summary:")
        print(f"  Total chunks: {len(chunks)}")
        print(f"  Total characters: {total_chars:,}")
        print(f"  Chunks with tables: {chunks_with_tables}")
        print(f"  Average chunk size: {total_chars // len(chunks):,} chars")
        print(f"{'='*60}\n")
        
        self.chunks = chunks
        return chunks
    
    def save_chunks(self, output_path: str):
        """Save chunks as JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.chunks, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved {len(self.chunks)} chunks to: {output_path}\n")


if __name__ == "__main__":
    # Configuration
    pdf_path = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000.pdf"
    output_path = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000_chunks.json"
    
    # Process
    processor = ISCodeProcessor(pdf_path, "IS 456:2000")
    chunks = processor.process()
    processor.save_chunks(output_path)
    
    # Show sample chunks
    print("📋 Sample chunks:\n")
    for chunk in chunks[:3]:
        print(f"  ID: {chunk['id']}")
        print(f"  Clause: {chunk['clause']} - {chunk['title']}")
        print(f"  Pages: {chunk['pages']}")
        print(f"  Size: {chunk['char_count']} chars")
        print(f"  Preview: {chunk['content'][:200]}...")
        print()
