# CiteCat

CiteCat is an AI-powered web application that allows users to upload PDF documents and interact with them through a conversational chat interface. It leverages Retrieval-Augmented Generation (RAG) to provide accurate, context-aware answers from your documents.

## Features

- **PDF Upload & Processing:** Upload PDF files and extract their content using an external PDF processing service.
- **AI Chat Interface:** Ask questions about your documents and receive intelligent, context-grounded responses.
- **Semantic Search:** Uses Pinecone vector database for fast, relevant retrieval of document content.
- **Persistent Chat & File Management:** Keeps chat history and manages uploaded files.
- **Secure Storage:** Uses MinIO for object storage.

## How RAG is Used

1. **PDF Extraction:** Text is extracted from PDFs using an external service.
2. **Chunking & Embedding:** The text is chunked and converted into vector embeddings.
3. **Vector Storage:** Embeddings are stored in Pinecone for semantic search.
4. **Retrieval & Generation:** On user query, relevant chunks are retrieved and combined with the query, then passed to Gemini AI for answer generation.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Prisma, PostgreSQL
- **Storage:** MinIO (S3-compatible)
- **Vector DB:** Pinecone
- **AI:** Google Gemini API

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/citecat.git
   cd citecat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required configuration.

## MinIO Setup

To set up MinIO for local development and file uploads, follow the instructions in [MINIO_SETUP.md](./MINIO_SETUP.md).
