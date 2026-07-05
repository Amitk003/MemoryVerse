# Architecture

## What is MemoryVerse?

MemoryVerse is an AI-powered Digital Identity System. It helps students organize their certificates, resumes, project reports, and other documents automatically. The system understands what each document is about, connects related documents together, and lets you search everything using natural language.

## Tech Stack

- **Frontend**: React with TypeScript and Tailwind CSS (runs in browser)
- **Backend**: Python FastAPI (handles requests and AI processing)
- **Database**: SQLite (stores document info)
- **Vector Store**: ChromaDB (stores embeddings for smart search)
- **AI**: Google Gemini 2.5 Flash (does classification, relationships, embeddings)

## How it Works

1. User uploads a document through the frontend
2. Backend saves the file and extracts text from it (PDF, image, etc.)
3. Gemini AI classifies the document into a category (project, skill, etc.)
4. The system creates a vector embedding and stores it in ChromaDB
5. Gemini finds relationships between this document and others
6. User can search using natural language - the system finds matching documents using vector similarity
7. A timeline view shows all achievements organized by date

## Folder Structure

- `backend/app/` - Python code
  - `api/` - Route handlers (endpoints)
  - `core/` - Config, database, Gemini setup
  - `models/` - Database tables
  - `schemas/` - Data validation
  - `services/` - Business logic
- `frontend/` - React code
- `docs/` - Documentation
- `logs/` - Development logs
