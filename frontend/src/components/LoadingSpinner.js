export default function LoadingSpinner({ text = "AI is thinking...", size = "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="relative flex items-center justify-center mb-4">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[var(--primary)] blur-xl opacity-30 rounded-full animate-pulse-border"></div>
        
        {/* Spinner */}
        <div className={`${sizeClasses[size]} rounded-full border-t-[var(--secondary)] border-r-[var(--primary)] border-b-[var(--accent)] border-l-transparent animate-spin relative z-10`}></div>
        
        {/* Inner core */}
        <div className="absolute inset-0 m-auto w-1/2 h-1/2 bg-white rounded-full opacity-20 blur-sm"></div>
      </div>
      
      {text && (
        <div className="text-gray-300 font-medium tracking-wide flex items-center gap-1">
          {text}
          <span className="flex space-x-1 ml-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </span>
        </div>
      )}
    </div>
  );
}
