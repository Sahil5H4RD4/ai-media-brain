/**
 * AI Media Brain — Backend Server
 * =================================
 * Express.js API server powering all AI features:
 * - Document Chat (RAG) with PDF upload
 * - YouTube Video Summarizer
 * - AI Content Generator
 * - Image Analyzer (Multimodal)
 *
 * Uses Google Gemini API for all AI operations.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import route modules
import pdfRoutes from "./routes/pdf.js";
import youtubeRoutes from "./routes/youtube.js";
import contentRoutes from "./routes/content.js";
import imageRoutes from "./routes/image.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api", pdfRoutes);
app.use("/api", youtubeRoutes);
app.use("/api", contentRoutes);
app.use("/api", imageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Media Brain API",
    timestamp: new Date().toISOString(),
    features: [
      "Document Chat (RAG)",
      "YouTube Summarizer",
      "Content Generator",
      "Image Analyzer",
    ],
  });
});

// ── Error Handling ────────────────────────────────────────────────────
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large. Maximum size is 10MB for PDFs, 5MB for images.",
    });
  }

  // Multer file type error
  if (err.message?.includes("Only")) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// ── Start Server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║    🧠 AI Media Brain — Backend API       ║
  ║    Running on http://localhost:${PORT}       ║
  ║                                          ║
  ║    Endpoints:                             ║
  ║    POST /api/upload-pdf                   ║
  ║    POST /api/query-doc                    ║
  ║    POST /api/youtube-summary              ║
  ║    POST /api/generate-content             ║
  ║    POST /api/analyze-image                ║
  ║    GET  /api/health                       ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
