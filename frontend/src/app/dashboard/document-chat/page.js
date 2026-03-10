"use client";

import { useState, useRef, useEffect } from "react";
import ContentCard from "@/components/ContentCard";
import FileUpload from "@/components/FileUpload";
import ChatMessage from "@/components/ChatMessage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DocumentChat() {
  const [docId, setDocId] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDocId(data.docId);
      setDocInfo({ filename: data.filename, pages: data.pages, chunks: data.chunks });
      
      setMessages([
        {
          role: "assistant",
          content: `I've successfully processed **${data.filename}** (${data.pages} pages). I'm ready to answer any questions you have about this document!`
        }
      ]);
    } catch (error) {
      setMessages([{ role: "assistant", content: `❌ **Error:** ${error.message}` }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !docId) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/query-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId,
          question: userMsg,
          history: newMessages.slice(0, -1) // Exclude current question from history sent as context
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: `❌ **Error:** ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] relative animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Document Chat <span className="text-sm font-normal text-[var(--primary)] border border-[var(--primary)] px-2 py-0.5 rounded ml-2">RAG</span></h1>
        <p className="text-gray-400">Upload a PDF and ask questions using Gemini Embeddings + LLM.</p>
      </div>

      {!docId && !isUploading && (
        <div className="flex-1 flex items-center justify-center">
          <ContentCard className="w-full max-w-xl animate-slide-up">
            <h3 className="text-xl font-medium text-white mb-6 text-center">Get started by uploading a document</h3>
            <FileUpload 
              accept={{ "application/pdf": [".pdf"] }} 
              onFileSelect={handleFileUpload} 
              label="Upload PDF Document"
            />
          </ContentCard>
        </div>
      )}

      {isUploading && (
        <div className="flex-1 flex items-center justify-center">
          <ContentCard className="w-full max-w-xl text-center">
            <LoadingSpinner text="Processing PDF structure and generating embeddings..." size="lg" />
            <p className="text-gray-400 mt-4 text-sm max-w-xs mx-auto">This may take a few moments depending on the document size.</p>
          </ContentCard>
        </div>
      )}

      {docId && (
        <div className="flex flex-col flex-1 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="bg-gray-900/80 px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white leading-tight">{docInfo?.filename}</h3>
                <p className="text-xs text-gray-400">{docInfo?.pages} Pages • Indexed in Vector Store</p>
              </div>
            </div>
            <button 
              onClick={() => { setDocId(null); setMessages([]); }}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Upload New
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-4 max-w-[85%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="p-4 rounded-2xl glass text-white rounded-tl-sm flex items-center h-12">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900/50 border-t border-[var(--card-border)]">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                disabled={isTyping}
                className="w-full bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
