# AI Media Brain

AI Media Brain is a full-stack, AI-powered web application built with Next.js, Express, and Google Gemini API. It provides a complete suite of intelligent tools designed specifically for digital content creators, researchers, and media professionals.

## Features

1. **Document Chat (RAG)**
   - Upload any PDF document
   - In-memory vector store uses Gemini Embeddings (`text-embedding-004`) + Cosine Similarity
   - Chat contextually with the document to extract precise answers with source citations.

2. **YouTube Summarizer**
   - Provide a YouTube video URL
   - Automatically extracts the video's transcript (using unofficial YouTube APIs)
   - Generates an executive summary, key takeaways, and underlying topics using Gemini 2.5 Flash.

3. **Content Generator**
   - Describe a topic and select a target platform (Blog, Twitter, LinkedIn)
   - Choose a desired tone (Professional, Casual, Humorous, etc.) and length
   - Get instantly generated, high-quality markdown content.

4. **Image Analyzer (Multimodal)**
   - Upload an image
   - Analyzed using Gemini's native multimodal capabilities
   - Generates a caption, a detailed visual breakdown, and a list of contextual tags.

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React
- Tailwind CSS v4 (Glassmorphism UI, Dark Theme)
- framer-motion (implicitly through CSS animations)

**Backend**
- Node.js & Express.js
- `@google/genai` (Official SDK for Gemini 2.0+)
- `pdf-parse`
- `youtube-transcript`
- Multer (in-memory file uploads)

**Database / Storage**
- *Vectors:* Custom In-Memory Vector Store utilizing Cosine Similarity
- *Blobs:* Ephemeral memory storage via Express Multer

## Setup & Installation

### Requirements
- Node.js (v18+ recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Usage

Once both servers are running, open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

- **Frontend:** Optimized for deployment on **Vercel**. Push to a repository and link it in the Vercel dashboard.
- **Backend:** Optimized for deployment on **Render** (Web Service). Set the environment variables in the Render dashboard.

*Note: Since the vector database is in-memory, restarting the backend server will clear any uploaded documents. For persistent production use, you can integrate ChromaDB or Pinecone into `utils/vectorStore.js`.*
