/**
 * Content Routes — AI Content Generator
 * ----------------------------------------
 * POST /api/generate-content — Generate structured content by type
 */

import { Router } from "express";
import { generateText, SYSTEM_PROMPTS } from "../utils/gemini.js";

const router = Router();

// Map content types to their system prompts
const CONTENT_TYPE_PROMPTS = {
  blog: SYSTEM_PROMPTS.contentBlog,
  tweet: SYSTEM_PROMPTS.contentTweet,
  linkedin: SYSTEM_PROMPTS.contentLinkedin,
};

// Tone modifiers
const TONE_INSTRUCTIONS = {
  professional: "Use a professional, authoritative tone.",
  casual: "Use a casual, friendly, conversational tone.",
  humorous: "Use a witty, humorous tone with clever analogies.",
  inspirational: "Use an inspirational, motivational tone.",
  educational: "Use an educational, informative tone with examples.",
};

/**
 * POST /api/generate-content
 * Generate content based on topic, type, tone, and length
 */
router.post("/generate-content", async (req, res) => {
  try {
    const { topic, type = "blog", tone = "professional", length = "medium" } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const validTypes = Object.keys(CONTENT_TYPE_PROMPTS);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid content type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    console.log(`✏️ Generating ${type} content about: "${topic.substring(0, 50)}"`);

    // Build the system prompt with tone and length instructions
    let systemPrompt = CONTENT_TYPE_PROMPTS[type];

    // Add tone
    if (TONE_INSTRUCTIONS[tone]) {
      systemPrompt += `\n\n${TONE_INSTRUCTIONS[tone]}`;
    }

    // Add length guidance
    const lengthGuide = {
      short: "Keep the content brief and concise. Maximum 150 words.",
      medium: "Write a medium-length piece. Around 300-500 words.",
      long: "Write a comprehensive, detailed piece. Around 800-1200 words.",
    };
    if (lengthGuide[length]) {
      systemPrompt += `\n\n${lengthGuide[length]}`;
    }

    // Generate content
    const prompt = `Create ${type} content about the following topic:\n\n"${topic}"`;
    const content = await generateText(prompt, systemPrompt);

    // Calculate word count
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

    res.json({
      content,
      type,
      topic,
      tone,
      wordCount,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

export default router;
