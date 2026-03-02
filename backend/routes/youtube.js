/**
 * YouTube Routes — Video Summarizer
 * ------------------------------------
 * POST /api/youtube-summary — Summarize a YouTube video from its URL
 */

import { Router } from "express";
import { getTranscript } from "../utils/youtube.js";
import { generateText, SYSTEM_PROMPTS } from "../utils/gemini.js";

const router = Router();

/**
 * POST /api/youtube-summary
 * Extract transcript and generate AI summary
 */
router.post("/youtube-summary", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || url.trim().length === 0) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    console.log(`🎬 Summarizing YouTube video: ${url}`);

    // Step 1: Fetch transcript
    const { text: transcript, videoId } = await getTranscript(url);

    if (!transcript || transcript.length < 50) {
      return res.status(400).json({
        error: "Transcript too short to summarize. The video may not have meaningful captions.",
      });
    }

    // Truncate transcript if very long (Gemini context limit)
    const maxChars = 30000;
    const truncatedTranscript =
      transcript.length > maxChars
        ? transcript.substring(0, maxChars) + "\n[... transcript truncated]"
        : transcript;

    // Step 2: Generate summary using Gemini
    const prompt = `Here is the transcript of a YouTube video:\n\n${truncatedTranscript}\n\nPlease analyze and summarize this video.`;

    const result = await generateText(prompt, SYSTEM_PROMPTS.youtubeSummary);

    // Step 3: Parse the structured response
    const parsed = parseYoutubeSummary(result);

    res.json({
      ...parsed,
      videoId,
      transcriptLength: transcript.length,
    });
  } catch (error) {
    console.error("YouTube summary error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize video" });
  }
});

/**
 * Parse the structured summary response from Gemini
 * Extracts: summary, keyPoints, topics from markdown format
 */
function parseYoutubeSummary(text) {
  const result = {
    summary: "",
    keyPoints: [],
    topics: [],
    rawText: text,
  };

  try {
    // Extract summary section
    const summaryMatch = text.match(/## Summary\s*\n([\s\S]*?)(?=## Key Points|$)/i);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }

    // Extract key points
    const keyPointsMatch = text.match(/## Key Points\s*\n([\s\S]*?)(?=## Key Topics|$)/i);
    if (keyPointsMatch) {
      result.keyPoints = keyPointsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter((point) => point.length > 0);
    }

    // Extract topics
    const topicsMatch = text.match(/## Key Topics\s*\n([\s\S]*?)$/i);
    if (topicsMatch) {
      result.topics = topicsMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t.length < 50);
    }

    // Fallback: if parsing fails, use raw text as summary
    if (!result.summary) {
      result.summary = text;
    }
  } catch {
    result.summary = text;
  }

  return result;
}

export default router;
