## ⚡ Pre-Computed Embeddings Setup

### 🎯 Goal
Generate embeddings once, load instantly for fast RAG

---

### ✅ Step 1: Generate Embeddings (Running...)

**Script:** `scripts/precompute_embeddings.py`

**Progress:**
- Total chunks: 437
- Processing: ~50 chunks/minute
- ETA: ~8-10 minutes

**Output:** `IS_456_2000_with_embeddings.json` (~3-5 MB)

---

### ⚡ Step 2: Enable Fast RAG

Once embeddings are generated:

```typescript
// src/lib/rag/config.ts
export const RAG_CONFIG = {
    ENABLED: true,  // ← Change to true
    TOP_K: 3,
    MIN_SIMILARITY: 0.7,
    SUPPORTED_DOMAINS: ['rcc', 'steel', 'general'],
};
```

---

### 📊 Performance Comparison

| Approach | First Query | Subsequent Queries | Total Time |
|----------|-------------|-------------------|------------|
| **Before (On-the-fly)** | 40+ sec | 40+ sec | 40 sec/query |
| **After (Pre-computed)** | ~3 sec | ~2 sec | 2-3 sec/query |

**Why it's fast:**
- Before: Generate 437 embeddings + search = **40 seconds**
- After: Generate 1 embedding + search = **2 seconds** ⚡

---

### 🔧 How It Works

**Pre-computed Approach:**
```
Startup:
  Load IS_456_2000_with_embeddings.json (1 second)
  └── 437 chunks with embeddings already attached

Query:
  1. Generate embedding for user query (1 API call = 0.5s)
  2. Compare against 437 pre-computed embeddings (0.1s)
  3. Return top 3 matches (0.01s)
  Total: ~2 seconds ⚡
```

**Old Approach:**
```
Query:
  1. Generate embedding for user query (1 API call = 0.5s)
  2. Generate 437 embeddings for all chunks (437 API calls = 38s) 😱
  3. Compare and return top 3 (0.1s)
  Total: ~40 seconds
```

---

### 📁 Files Created/Updated

1. ✅ `scripts/precompute_embeddings.py` - Embedding generator
2. ✅ `src/lib/rag/vector-store.ts` - Updated to load pre-computed
3. ✅ `src/lib/rag/config.ts` - RAG toggle
4. ⏳ `documents/IS_456_2000_with_embeddings.json` - Generating...

---

### 🧪 Testing After Completion

1. **Wait for script to finish** (~10 min total)
2. **Enable RAG** in `config.ts`
3. **Restart dev server**
4. **Refresh browser**
5. **Ask RCC question**
6. **Should be fast!** (2-3 seconds)

---

### 🎁 Bonus: Add More Codes

Once this works, you can easily add more codes:

```bash
# Process new PDF
python scripts/process_is_code.py --input IS_875.pdf --output IS_875_chunks.json

# Pre-compute embeddings
python scripts/precompute_embeddings.py --input IS_875_chunks.json

# Update vector store to load multiple codes
```

---

### ⚠️ Note on Chunk Quality

Remember: Current chunks have minimal content (just TOC entries).

**For best results:**
1. ✅ Use pre-computed embeddings (fast)
2. 🔄 Later: Fix PDF processing for full content
3. ⚡ Re-generate embeddings with better chunks

**Current chunks work okay for:**
- Finding relevant sections
- General guidance
- Quick answers

**But limited for:**
- Detailed specifications
- Exact numerical values
- Complex calculations

---

**Status: Waiting for embedding generation to complete...** 🔄
