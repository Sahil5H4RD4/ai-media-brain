/**
 * Image Routes — AI Image Analyzer (Multimodal)
 * ------------------------------------------------
 * POST /api/analyze-image — Upload and analyze an image with Gemini Vision
 */

import { Router } from "express";
import multer from "multer";
import { generateFromImage } from "../utils/gemini.js";

const router = Router();

// Configure multer for image uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
    }
  },
});

/**
 * POST /api/analyze-image
 * Upload an image and get AI-generated analysis
 */
router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    console.log(`🖼️ Analyzing image: ${req.file.originalname} (${req.file.mimetype}, ${(req.file.size / 1024).toFixed(1)}KB)`);

    // Send image to Gemini for analysis
    const prompt = "Analyze this image thoroughly. Provide a caption, detailed analysis, and relevant themes/tags.";

    const result = await generateFromImage(
      req.file.buffer,
      req.file.mimetype,
      prompt
    );

    // Parse the structured response
    const parsed = parseImageAnalysis(result);

    res.json({
      ...parsed,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("Image analysis error:", error);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image file too large. Maximum size is 5MB." });
    }

    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

/**
 * Parse the structured analysis response from Gemini
 */
function parseImageAnalysis(text) {
  const result = {
    caption: "",
    explanation: "",
    themes: [],
    rawText: text,
  };

  try {
    // Extract caption
    const captionMatch = text.match(/## Caption\s*\n([\s\S]*?)(?=## Detailed Analysis|$)/i);
    if (captionMatch) {
      result.caption = captionMatch[1].trim();
    }

    // Extract detailed analysis
    const analysisMatch = text.match(/## Detailed Analysis\s*\n([\s\S]*?)(?=## Themes|$)/i);
    if (analysisMatch) {
      result.explanation = analysisMatch[1].trim();
    }

    // Extract themes
    const themesMatch = text.match(/## Themes & Tags\s*\n([\s\S]*?)$/i);
    if (themesMatch) {
      result.themes = themesMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t.length < 50);
    }

    // Fallback
    if (!result.caption) {
      const firstLine = text.split("\n").find((l) => l.trim().length > 0);
      result.caption = firstLine || "Image analysis";
      result.explanation = text;
    }
  } catch {
    result.caption = "Image analysis";
    result.explanation = text;
  }

  return result;
}

export default router;
