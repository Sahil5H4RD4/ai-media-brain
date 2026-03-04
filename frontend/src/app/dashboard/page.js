import Link from "next/link";
import ContentCard from "@/components/ContentCard";

export default function Dashboard() {
  const features = [
    {
      title: "Document Chat (RAG)",
      description: "Upload PDFs and instantly chat with them. AI grounds answers securely using context.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/dashboard/document-chat",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "YouTube Summarizer",
      description: "Turn long videos into concise summaries, key bullet points, and topics in seconds.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "/dashboard/youtube-summarizer",
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Content Generator",
      description: "Generate structured, high-quality posts for Blogs, Twitter, and LinkedIn.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      href: "/dashboard/content-generator",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Image Analyzer",
      description: "Upload an image and use Gemini Vision to get detailed captions and analysis.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: "/dashboard/image-analyzer",
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Welcome to <span className="text-gradient">AI Media Brain</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your intelligent workspace powered by Google Gemini. What would you like to achieve today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <Link key={idx} href={feature.href} className="group block h-full animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <ContentCard>
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 flex-grow">{feature.description}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-[var(--secondary)] group-hover:text-[var(--primary)] transition-colors">
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </ContentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
