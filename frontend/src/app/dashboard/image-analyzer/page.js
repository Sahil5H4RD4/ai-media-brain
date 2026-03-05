"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import FileUpload from "@/components/FileUpload";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function ImageAnalyzer() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch("http://localhost:5000/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to analyze image");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Image Analyzer <span className="text-sm font-normal text-emerald-400 border border-emerald-400 px-2 py-0.5 rounded ml-2">Multimodal</span></h1>
        <p className="text-gray-400">Upload any image to get detailed captions and analysis using Gemini Vision.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload & Preview */}
        <div className="space-y-6">
          <ContentCard className="border-t-4 border-t-teal-500">
            {!imagePreview ? (
              <div className="py-8">
                <FileUpload 
                  accept={{ 
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"]
                  }} 
                  maxSize={5 * 1024 * 1024} // 5MB
                  onFileSelect={handleImageSelect} 
                  label="Upload an Image (Max 5MB)"
                />
              </div>
            ) : (
              <div className="space-y-4 animate-scale-up">
                <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-black aspect-square max-h-[400px] flex items-center justify-center group">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-contain" 
                    unoptimized 
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={clearImage}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove Selected Image
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || result}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-medium rounded-xl shadow-lg hover:shadow-teal-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing with AI Vision...
                    </>
                  ) : result ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Analysis Complete
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Analyze Image
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-200 font-medium">{error}</span>
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right Column: Results */}
        <div className="h-full">
          {isLoading ? (
            <div className="h-full min-h-[400px] flex items-center justify-center p-8 bg-[var(--card)] rounded-2xl border border-[var(--card-border)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse"></div>
               <LoadingSpinner text="Consulting Gemini Multimodal Model..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-slide-up">
              {/* Caption Card */}
              <div className="bg-gradient-to-br from-[var(--card)] to-gray-900 border border-[var(--card-border)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Generated Caption</h3>
                <p className="text-xl md:text-2xl font-medium text-white leading-tight relative font-serif italic">
                  &ldquo;{result.caption}&rdquo;
                </p>
              </div>

              {/* Detailed Analysis */}
              <ContentCard>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Detailed Analysis
                </h3>
                <div className="prose prose-invert prose-emerald max-w-none text-gray-300">
                  <ReactMarkdown>{result.explanation || "No detailed analysis provided."}</ReactMarkdown>
                </div>
              </ContentCard>

              {/* Themes / Tags */}
              {result.themes && result.themes.length > 0 && (
                <ContentCard>
                   <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Detected Themes & Tags</h3>
                   <div className="flex flex-wrap gap-2">
                      {result.themes.map((theme, i) => (
                        <span key={i} className="px-4 py-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-full text-sm font-medium hover:bg-teal-500/20 transition-colors cursor-default">
                          {theme.trim().replace(/^#/, '')}
                        </span>
                      ))}
                   </div>
                </ContentCard>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center p-8 bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-800">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl text-white font-medium mb-2">Awaiting Image</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Upload an image on the left and click analyze to see Gemini Multimodal in action.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
