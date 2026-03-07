/**
 * Gemini AI Client & Helpers
 * ---------------------------
 * Centralized module for all Google Gemini API interactions.
 * Uses the @google/genai SDK with gemini-2.5-flash for text/vision
 * and text-embedding-004 for embeddings.
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// ── Initialize Gemini client ────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Model constants ─────────────────────────────────────────────────────
const TEXT_MODEL = "gemini-2.5-flash";
const EMBEDDING_MODEL = "text-embedding-004";

// ── System Prompt Templates ─────────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  // RAG document chat — strictly grounded in context
  documentChat: `You are a helpful document assistant. You MUST answer questions ONLY based on the provided context. 
If the answer cannot be found in the context, say "I couldn't find this information in the uploaded document."
Be concise, accurate, and cite which parts of the document your answer comes from.
Format your response in clear markdown when appropriate.`,

  // YouTube video summarizer
  youtubeSummary: `You are an expert content summarizer. Given a YouTube video transcript, provide:
1. A clear, concise **Summary** (2-3 paragraphs)
2. **Key Points** as a bullet list (5-8 points)
3. **Key Topics** as a comma-separated list of tags

Format your response EXACTLY as:
## Summary
[your summary here]

## Key Points
- [point 1]
- [point 2]
...

## Key Topics
[topic1], [topic2], [topic3]...

Be concise and accurate. Do not add information not present in the transcript.`,

  // Content generator — type-specific prompts
  contentBlog: `You are a professional blog writer. Write a well-structured blog post on the given topic.
Include a compelling title, introduction, main body with subheadings, and conclusion.
Use markdown formatting. Aim for engaging, informative content.`,

  contentTweet: `You are a social media expert specializing in Twitter/X. 
Create a compelling tweet thread (3-5 tweets) on the given topic.
Each tweet must be under 280 characters. Use relevant emojis and hashtags.
Format each tweet on a new line prefixed with the tweet number.`,

  contentLinkedin: `You are a LinkedIn thought leader. Write a professional LinkedIn post on the given topic.
Start with a hook line, provide value in the body, and end with a call to action.
Use line breaks for readability. Include relevant hashtags at the end.`,

  // Image analyzer
  imageAnalysis: `You are an expert image analyst. Analyze the provided image and return:
1. **Caption**: A concise one-line caption describing the image
2. **Detailed Analysis**: A thorough explanation of what you see (colors, objects, composition, mood, context)
3. **Themes & Tags**: A list of relevant themes and tags

Format your response EXACTLY as:
## Caption
[one-line caption]

## Detailed Analysis
[your detailed analysis]

## Themes & Tags
[tag1], [tag2], [tag3]...`
};

// ── Text Generation ─────────────────────────────────────────────────────
/**
 * Generate text using Gemini with optional system prompt and chat history
 * @param {string} prompt - User's prompt
 * @param {string} systemPrompt - System instructions
 * @param {Array} history - Previous chat messages [{role, content}]
 * @returns {string} Generated text
 */
export async function generateText(prompt, systemPrompt = "", history = []) {
  try {
    // Build contents array with history
    const contents = [];

    // Add chat history if present
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Add current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt || undefined,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini generateText error:", error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// ── Multimodal (Image) Generation ───────────────────────────────────────
/**
 * Analyze an image using Gemini multimodal capabilities
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @param {string} prompt - Analysis prompt
 * @returns {string} Generated analysis
 */
export async function generateFromImage(imageBuffer, mimeType, prompt) {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPTS.imageAnalysis,
        temperature: 0.5,
        maxOutputTokens: 2048,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini image analysis error:", error.message);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

// ── Embedding Generation ────────────────────────────────────────────────
/**
 * Generate embedding vector for a text string
 * @param {string} text - Text to embed
 * @returns {number[]} Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const result = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
    });

    return result.embedding.values;
  } catch (error) {
    console.error("Gemini embedding error:", error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple text chunks (batch)
 * @param {string[]} texts - Array of text strings
 * @returns {number[][]} Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  const embeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((text) => generateEmbedding(text))
    );
    embeddings.push(...batchResults);

    // Small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return embeddings;
}

export default ai;
