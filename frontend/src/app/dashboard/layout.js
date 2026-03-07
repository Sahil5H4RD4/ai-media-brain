export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Dynamic import of the client Sidebar component is unnecessary since we can just use normal import if we add 'use client' to it, which we did. */}
      {/* But since layout is server component, we need to import it */}
      <SidebarWrapper />
      
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)] opacity-10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--secondary)] opacity-10 blur-[100px] pointer-events-none"></div>
        
        <div className="p-6 md:p-8 lg:p-10 min-h-full max-w-7xl mx-auto z-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}

// Simple wrapper since layout is server component
import Sidebar from "@/components/Sidebar";
function SidebarWrapper() {
  return <Sidebar />;
}
