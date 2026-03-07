/**
 * PDF Routes — Document Chat (RAG)
 * ----------------------------------
 * POST /api/upload-pdf  — Upload & process PDF for RAG
 * POST /api/query-doc   — Ask questions about an uploaded document
 * GET  /api/documents   — List all uploaded documents
 * DELETE /api/documents/:docId — Remove a document
 */

import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { extractText, chunkText } from "../utils/pdfParser.js";
import { generateEmbeddings, generateEmbedding, generateText, SYSTEM_PROMPTS } from "../utils/gemini.js";
import { addDocument, search, listDocuments, deleteDocument, hasDocument } from "../utils/vectorStore.js";

const router = Router();

// Configure multer for PDF uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

/**
 * POST /api/upload-pdf
 * Upload a PDF, extract text, chunk, embed, and store in vector DB
 */
router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    console.log(`📤 Processing PDF: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

    // Step 1: Extract text from PDF
    const { text, pages } = await extractText(req.file.buffer);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: "Could not extract meaningful text from this PDF. The file may be image-based or empty.",
      });
    }

    // Step 2: Split text into chunks
    const chunks = chunkText(text, 500, 50);
    console.log(`📝 Split into ${chunks.length} chunks from ${pages} pages`);

    // Step 3: Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks);

    // Step 4: Store in vector store
    const docId = uuidv4();
    addDocument(docId, chunks, embeddings, {
      filename: req.file.originalname,
      pages,
      fileSize: req.file.size,
    });

    res.json({
      docId,
      chunks: chunks.length,
      pages,
      filename: req.file.originalname,
      message: "PDF processed successfully. You can now ask questions about this document.",
    });
  } catch (error) {
    console.error("Upload PDF error:", error);
    res.status(500).json({ error: error.message || "Failed to process PDF" });
  }
});

/**
 * POST /api/query-doc
 * Ask a question about an uploaded document using RAG
 */
router.post("/query-doc", async (req, res) => {
  try {
    const { docId, question, history = [] } = req.body;

    if (!docId) {
      return res.status(400).json({ error: "Document ID is required" });
    }
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }
    if (!hasDocument(docId)) {
      return res.status(404).json({ error: "Document not found. Please upload a PDF first." });
    }

    console.log(`❓ Query: "${question.substring(0, 50)}..." on doc ${docId.substring(0, 8)}`);

    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);

    // Step 2: Search for relevant chunks
    const results = search(docId, queryEmbedding, 5);
    const relevantChunks = results.map((r) => r.chunk);

    // Step 3: Build context-augmented prompt
    const contextStr = relevantChunks
      .map((chunk, i) => `[Source ${i + 1}]: ${chunk}`)
      .join("\n\n");

    const augmentedPrompt = `Context from the uploaded document:\n${contextStr}\n\n---\n\nUser Question: ${question}`;

    // Step 4: Generate answer using Gemini with RAG context
    const answer = await generateText(
      augmentedPrompt,
      SYSTEM_PROMPTS.documentChat,
      history.slice(-6) // Keep last 6 messages for context window
    );

    res.json({
      answer,
      sources: relevantChunks.slice(0, 3), // Return top 3 source chunks
      scores: results.slice(0, 3).map((r) => r.score.toFixed(3)),
    });
  } catch (error) {
    console.error("Query doc error:", error);
    res.status(500).json({ error: error.message || "Failed to answer question" });
  }
});

/**
 * GET /api/documents
 * List all uploaded documents
 */
router.get("/documents", (req, res) => {
  const docs = listDocuments();
  res.json({ documents: docs });
});

/**
 * DELETE /api/documents/:docId
 * Remove a document from the store
 */
router.delete("/documents/:docId", (req, res) => {
  const { docId } = req.params;
  const deleted = deleteDocument(docId);

  if (deleted) {
    res.json({ message: "Document removed successfully" });
  } else {
    res.status(404).json({ error: "Document not found" });
  }
});

export default router;
