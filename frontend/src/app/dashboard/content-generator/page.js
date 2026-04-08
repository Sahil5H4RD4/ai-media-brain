"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";

export default function ContentGenerator() {
  const [formData, setFormData] = useState({
    topic: "",
    type: "blog",
    tone: "professional",
    length: "medium",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate content");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      // Optional: Add a brief "Copied!" notification here
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Content Generator</h1>
        <p className="text-gray-400">Create high-quality, structured content tailored for specific platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <ContentCard>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Topic</label>
                <textarea
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="What should the content be about?"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {['blog', 'tweet', 'linkedin'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, type})}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.type === type 
                          ? "bg-[var(--secondary)]/10 border-[var(--secondary)] text-[var(--secondary)]" 
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600 flex-1 hover:text-gray-200"
                      }`}
                    >
                      {type === 'tweet' ? 'Twitter' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                >
                  <option value="professional">Professional & Authoritative</option>
                  <option value="casual">Casual & Conversational</option>
                  <option value="humorous">Humorous & Witty</option>
                  <option value="inspirational">Inspirational & Motivational</option>
                  <option value="educational">Educational & Informative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Length</label>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-1 flex">
                  {['short', 'medium', 'long'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setFormData({...formData, length: len})}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        formData.length === len 
                          ? "bg-[var(--primary)]/10 border-[var(--primary)] text-white" 
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600 hover:text-gray-200"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.topic.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="h-full min-h-[500px] flex items-center justify-center bg-[var(--card)] border border-[var(--card-border)] rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-pulse-border border-2 rounded-2xl"></div>
              <LoadingSpinner text="Crafting your content..." size="lg" />
            </div>
          ) : result ? (
            <div className="h-full flex flex-col bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden animate-slide-up">
              {/* Result Header */}
              <div className="px-6 py-4 border-b border-[var(--card-border)] bg-gray-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium uppercase tracking-wider">
                    {result.type === 'tweet' ? 'Twitter' : result.type}
                  </span>
                  <span className="text-gray-400 text-sm">~{result.wordCount} words</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="prose prose-invert prose-purple max-w-none">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to create</h3>
                <p className="text-gray-500 max-w-md text-center">
                  Fill out the parameters on the left and click generate to let Gemini craft perfect content for your audience.
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
