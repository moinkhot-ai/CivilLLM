"""
IS Code PDF Analyzer
Analyzes structure and extracts content from IS codes for RAG processing
"""

import sys
import json
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber

def analyze_pdf(pdf_path):
    """Analyze PDF structure and extract sample content"""
    
    results = {
        'metadata': {},
        'structure': {},
        'sample_pages': [],
        'tables_found': 0,
        'total_pages': 0,
        'sections': []
    }
    
    print(f"\n{'='*60}")
    print(f"Analyzing: {pdf_path}")
    print(f"{'='*60}\n")
    
    with pdfplumber.open(pdf_path) as pdf:
        results['total_pages'] = len(pdf.pages)
        results['metadata'] = pdf.metadata
        
        print(f"📄 Total Pages: {len(pdf.pages)}")
        print(f"📋 Metadata: {json.dumps(pdf.metadata, indent=2, default=str)}\n")
        
        # Analyze first 10 pages
        for i, page in enumerate(pdf.pages[:10]):
            page_num = i + 1
            print(f"\n--- Page {page_num} ---")
            
            # Extract text
            text = page.extract_text()
            if text:
                lines = text.split('\n')[:10]  # First 10 lines
                print(f"Text preview (first 10 lines):")
                for line in lines:
                    print(f"  {line[:80]}")
            
            # Check for tables
            tables = page.extract_tables()
            if tables:
                results['tables_found'] += len(tables)
                print(f"\n📊 Tables found: {len(tables)}")
                for j, table in enumerate(tables[:1]):  # Show first table
                    print(f"\nTable {j+1} preview:")
                    for row in table[:3]:  # First 3 rows
                        print(f"  {row}")
            
            # Store sample
            results['sample_pages'].append({
                'page_num': page_num,
                'text_preview': text[:500] if text else None,
                'tables_count': len(tables) if tables else 0
            })
            
            # Look for section headings (typically bold or larger font)
            words = page.extract_words()
            if words:
                # Detect potential headings (simplified)
                for word in words[:20]:
                    if 'size' in word and word.get('size', 0) > 12:
                        results['sections'].append({
                            'page': page_num,
                            'text': word.get('text'),
                            'size': word.get('size')
                        })
        
        print(f"\n{'='*60}")
        print(f"📊 Summary:")
        print(f"  Total pages: {results['total_pages']}")
        print(f"  Tables found: {results['tables_found']}")
        print(f"  Potential sections: {len(results['sections'])}")
        print(f"{'='*60}\n")
    
    return results


if __name__ == "__main__":
    pdf_path = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_2000.pdf"
    
    if not Path(pdf_path).exists():
        print(f"❌ PDF not found at: {pdf_path}")
        sys.exit(1)
    
    results = analyze_pdf(pdf_path)
    
    # Save results
    output_file = r"C:\Users\moink\Desktop\CivilLLM\documents\IS_456_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"✅ Analysis saved to: {output_file}")
