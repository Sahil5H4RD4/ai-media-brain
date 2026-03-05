"use client";

import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? "bg-gray-700 text-white" 
            : "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/20"
        }`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`p-4 rounded-2xl ${
          isUser 
            ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-tr-sm border border-gray-600" 
            : "glass text-white rounded-tl-sm border border-[rgba(255,255,255,0.05)] shadow-xl"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none text-gray-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
