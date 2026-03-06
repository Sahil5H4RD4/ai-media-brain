/**
 * YouTube Transcript Fetcher
 * ---------------------------
 * Fetches transcripts from YouTube videos for summarization.
 */
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";
/**
 * Extract video ID from various YouTube URL formats
 * Handles: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, etc.
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
export function extractVideoId(url) {
  if (!url) return null;

  // Already a video ID (11 chars, alphanumeric + dash/underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    // youtube.com/watch?v=VIDEO_ID
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // youtube.com/embed/VIDEO_ID
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/embed/")[1]?.split("/")[0];
      }
      // youtube.com/v/VIDEO_ID
      if (urlObj.pathname.startsWith("/v/")) {
        return urlObj.pathname.split("/v/")[1]?.split("/")[0];
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      return urlObj.pathname.slice(1).split("/")[0];
    }
  } catch {
    // Invalid URL
    return null;
  }

  return null;
}

/**
 * Fetch transcript from a YouTube video
 * @param {string} url - YouTube video URL or ID
 * @returns {Promise<{ text: string, segments: Array }>}
 */
export async function getTranscript(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error(
      "Invalid YouTube URL. Please provide a valid YouTube video link."
    );
  }

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      throw new Error(
        "No transcript available for this video. The video may not have captions enabled."
      );
    }

    // Combine all segments into a single text
    const fullText = segments.map((seg) => seg.text).join(" ");

    return {
      text: fullText,
      segments: segments.map((seg) => ({
        text: seg.text,
        offset: seg.offset,
        duration: seg.duration,
      })),
      videoId,
    };
  } catch (error) {
    if (error.message.includes("No transcript")) {
      throw error;
    }
    console.error("YouTube transcript error:", error.message);
    throw new Error(
      `Failed to fetch transcript: ${error.message}. Make sure the video has captions enabled.`
    );
  }
}

export default { getTranscript, extractVideoId };
