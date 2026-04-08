"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/youtube-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">YouTube Summarizer</h1>
        <p className="text-gray-400">Extract insights, key points, and summaries from any YouTube video in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input form */}
        <div className="lg:col-span-5 space-y-6">
          <ContentCard>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Video Details
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-red-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Video...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Generate Summary
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}
          </ContentCard>

          {/* Mini preview if URL is available */}
          {result?.videoId && (
            <ContentCard className="hidden lg:block animate-slide-up">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-900 relative">
                <iframe
                  src={`https://www.youtube.com/embed/${result.videoId}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                ></iframe>
              </div>
            </ContentCard>
          )}
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <ContentCard className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner text="Analyzing transcript with Gemini..." />
            </ContentCard>
          ) : result ? (
            <div className="space-y-6 animate-slide-up">
              {/* Summary Block */}
              <ContentCard>
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📝</span> Executive Summary
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.summary)}
                    className="p-1.5 text-gray-400 hover:text-white rounded bg-gray-800 hover:bg-gray-700 transition"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{result.summary}</ReactMarkdown>
                </div>
              </ContentCard>

              {/* Key Points */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <ContentCard>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <span className="text-2xl">🔑</span> Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {result.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
                        <div className="mt-0.5 text-orange-500 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-200"><ReactMarkdown components={{p: 'span'}}>{point}</ReactMarkdown></span>
                      </li>
                    ))}
                  </ul>
                </ContentCard>
              )}

              {/* Topics */}
              {result.topics && result.topics.length > 0 && (
                <ContentCard>
                  <h3 className="text-base font-semibold text-gray-400 mb-3 uppercase tracking-wider text-sm">Detected Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.topics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-300 rounded-full text-sm">
                        #{topic.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                </ContentCard>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
              <div className="text-center p-8 z-10">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Summary Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Enter a YouTube URL on the left to generate an AI-powered summary with key insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
