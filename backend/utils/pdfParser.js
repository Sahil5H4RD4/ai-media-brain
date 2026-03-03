/**
 * PDF Parser & Text Chunker
 * --------------------------
 * Extracts text from PDF files and splits into overlapping chunks
 * for embedding and vector storage.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extract all text content from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{ text: string, pages: number, info: object }>}
 */
export async function extractText(buffer) {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Split text into overlapping chunks for embedding
 * Uses a sliding window approach to preserve context across chunk boundaries.
 *
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size of each chunk in characters (default: 500)
 * @param {number} overlap - Overlap between consecutive chunks (default: 50)
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, chunkSize = 500, overlap = 50) {
  // Clean and normalize whitespace
  const cleanText = text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanText || cleanText.length === 0) {
    return [];
  }

  // If text is shorter than chunk size, return as single chunk
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;

    // Try to break at a sentence boundary (., !, ?) or paragraph
    if (end < cleanText.length) {
      // Look for the last sentence-ending punctuation within the chunk
      const searchWindow = cleanText.substring(
        Math.max(start, end - 100),
        end
      );
      const lastPeriod = searchWindow.lastIndexOf(". ");
      const lastQuestion = searchWindow.lastIndexOf("? ");
      const lastExclaim = searchWindow.lastIndexOf("! ");
      const lastNewline = searchWindow.lastIndexOf("\n");

      const bestBreak = Math.max(
        lastPeriod,
        lastQuestion,
        lastExclaim,
        lastNewline
      );

      if (bestBreak > 0) {
        end = end - 100 + Math.max(0, Math.max(start, end - 100) - start) + bestBreak + 1;
      }
    } else {
      end = cleanText.length;
    }

    const chunk = cleanText.substring(start, end).trim();
    if (chunk.length > 20) {
      // Skip very short chunks
      chunks.push(chunk);
    }

    // Move start forward, accounting for overlap
    start = end - overlap;

    // Prevent infinite loops
    if (start >= cleanText.length - overlap) break;
  }

  return chunks;
}

export default { extractText, chunkText };
