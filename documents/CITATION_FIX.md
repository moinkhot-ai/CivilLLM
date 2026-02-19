## 🔧 Citation Accuracy Fix

### Problem Identified
The model was citing **wrong clause numbers** because:
1. Many chunks have minimal content (just titles from Table of Contents)
2. The prompt wasn't strict enough about using ONLY retrieved citations

### Solutions Applied

#### ✅ **1. Stricter Prompt (DONE)**
Updated `src/lib/rag/index.ts` with:
- **CRITICAL WARNINGS** to prevent hallucination
- **EXACT CITATION LIST** showing only allowed clause numbers
- **FALLBACK INSTRUCTION** if info isn't in retrieved chunks
- **MANDATORY FORMAT** enforcement

**New Prompt Features:**
```
⚠️ CRITICAL INSTRUCTIONS:
1. ONLY USE THE SOURCES PROVIDED BELOW
2. CITE EXACTLY AS SHOWN
3. NO HALLUCINATIONS
4. MANDATORY FORMAT: "According to [exact citation]..."

CLAUSES YOU CAN CITE (ONLY THESE):
✓ Source 1: IS 456:2000, Clause X.Y...
✓ Source 2: ...
```

#### 🔄 **2. Improve PDF Processing (TODO)**

**Current Issue:**
```json
{
  "clause": "13.5",
  "title": "Curing 27",
  "content": "13.5 Curing 27",  // ❌ Only 14 chars!
  "char_count": 14
}
```

**What We Need:**
```json
{
  "clause": "13.5",
  "title": "Curing",
  "content": "13.5 Curing\n\nConcrete shall be cured for at least 7 days from the date of placing in the case of Ordinary Portland cement and at least 10 days where mineral admixtures or blended cements are used. The period of curing shall not be less than 10 days for concrete exposed to dry and hot weather conditions. For concrete where mineral admixtures or blended cements are used, it is recommended that above minimum periods may be extended to 14 days...",
  "char_count": 450
}
```

### How to Fix Chunking

**Option 1: Re-process PDF with Better Extraction**
```python
# Update scripts/process_is_code.py
def chunk_by_clause(self, pages_data):
    # Instead of breaking on new clause immediately,
    # collect all content until NEXT clause is found
    
    current_content = []
    for line in lines:
        clause_info = self.detect_clause_structure(line)
        if clause_info and current_chunk['content']:
            # Save previous chunk with ALL accumulated content
            current_chunk['content'] = '\n'.join(current_content)
            chunks.append(current_chunk)
            current_content = [line]  # Start new
        else:
            current_content.append(line)  # Keep accumulating
```

**Option 2: Use OCR/Better PDF Parser**
```bash
pip install pdfminer.six  # Better text extraction
# OR
pip install pytesseract    # For scanned PDFs
```

**Option 3: Manual Chunk Creation**
- Extract full text from PDF
- Manually mark clause boundaries
- Create proper chunks with complete content

### Test the Current Fix

1. **Refresh browser**
2. Ask: *"What is curing period for concrete?"*
3. **Check response** - should say:
   - Either cites the exact (limited) clause found
   - OR says "The retrieved sections mention Clause 13.5, but full details aren't in the extracted text"

### Next Steps

**Priority 1: Test Current Fix** ⚡
- See if stricter prompt prevents hallucinations
- Model should now admit when it doesn't have full info

**Priority 2: Re-process IS 456** 📄
- Fix the chunking algorithm
- Get full clause content (not just titles)

**Priority 3: Add More Codes** 📚
- Once chunking is fixed, process:
  - IS 875 (Loads)
  - IS 13920 (Ductile detailing)
  - NBC 2016

### Expected Behavior Now

**Before:**
```
Q: What is the curing period?
A: According to IS 456:2000, Clause 13.5.2, the minimum curing period is 7 days...
   ❌ Clause 13.5.2 was hallucinated!
```

**After:**
```
Q: What is the curing period?
A: The retrieved code references mention IS 456:2000, Clause 13.5 (Curing), 
   but the extracted text doesn't contain the full specifications. Based on 
   standard RCC practice and general IS 456 requirements, concrete should be 
   cured for at least 7 days for OPC...
   
   **Sources:** Source 1: IS 456:2000, Clause 13.5
   ✅ Only cites what was actually retrieved!
```

---

**Try it now and let me know if citations are more accurate!** 🎯
