/**
 * In-Memory Vector Store
 * -----------------------
 * Lightweight vector database using cosine similarity for document retrieval.
 * Stores document chunks + their Gemini embeddings in memory.
 * Suitable for single-server deployments; swap for ChromaDB in production if needed.
 */

// ── Store: Map<docId, { chunks, embeddings, metadata }> ────────────────
const store = new Map();

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - Vector A
 * @param {number[]} b - Vector B
 * @returns {number} Similarity score between -1 and 1
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimension");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

/**
 * Add a document's chunks and embeddings to the store
 * @param {string} docId - Unique document identifier
 * @param {string[]} chunks - Text chunks from the document
 * @param {number[][]} embeddings - Corresponding embedding vectors
 * @param {object} metadata - Document metadata (filename, uploadDate, etc.)
 */
export function addDocument(docId, chunks, embeddings, metadata = {}) {
  if (chunks.length !== embeddings.length) {
    throw new Error("Chunks and embeddings must have the same length");
  }

  store.set(docId, {
    chunks,
    embeddings,
    metadata: {
      ...metadata,
      uploadDate: new Date().toISOString(),
      chunkCount: chunks.length,
    },
  });

  console.log(`📄 Stored document ${docId}: ${chunks.length} chunks`);
}

/**
 * Search for the most relevant chunks using cosine similarity
 * @param {string} docId - Document to search within
 * @param {number[]} queryEmbedding - Query embedding vector
 * @param {number} topK - Number of top results to return (default: 5)
 * @returns {{ chunk: string, score: number, index: number }[]} Ranked results
 */
export function search(docId, queryEmbedding, topK = 5) {
  const doc = store.get(docId);
  if (!doc) {
    throw new Error(`Document ${docId} not found in store`);
  }

  // Calculate similarity scores for all chunks
  const scored = doc.chunks.map((chunk, index) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, doc.embeddings[index]),
    index,
  }));

  // Sort by score descending and return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Delete a document from the store
 * @param {string} docId - Document to remove
 * @returns {boolean} Whether the document was found and removed
 */
export function deleteDocument(docId) {
  const existed = store.has(docId);
  store.delete(docId);
  if (existed) console.log(`🗑️ Deleted document ${docId}`);
  return existed;
}

/**
 * List all stored documents with metadata
 * @returns {{ docId: string, metadata: object }[]}
 */
export function listDocuments() {
  const docs = [];
  for (const [docId, data] of store) {
    docs.push({ docId, metadata: data.metadata });
  }
  return docs;
}

/**
 * Check if a document exists in the store
 * @param {string} docId
 * @returns {boolean}
 */
export function hasDocument(docId) {
  return store.has(docId);
}

/**
 * Get document metadata
 * @param {string} docId
 * @returns {object|null}
 */
export function getDocumentMeta(docId) {
  const doc = store.get(docId);
  return doc ? doc.metadata : null;
}

export default {
  addDocument,
  search,
  deleteDocument,
  listDocuments,
  hasDocument,
  getDocumentMeta,
};
