export default function ContentCard({ children, className = "" }) {
  return (
    <div className={`glass-card p-6 h-full relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all duration-300 ${className}`}>
      {/* Animated gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content wrapper to raise above the background effects */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
