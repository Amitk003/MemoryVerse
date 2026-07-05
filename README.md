# MemoryVerse

AI-powered Digital Identity System that helps students organize, connect, and instantly retrieve their academic and professional documents.

## What it does

MemoryVerse transforms scattered documents into a structured, searchable knowledge repository. Upload any file - certificates, resumes, project reports - and the system automatically understands, categorizes, and connects them.

## Features

- **Smart Upload**: Upload PDFs, images, DOCX files - the system extracts text automatically
- **Auto Categorization**: AI classifies documents into Projects, Skills, Certifications, Internships, Achievements, and Academics
- **Connection Engine**: Discovers relationships between your documents (certification -> skill -> project -> internship)
- **Timeline View**: See your growth organized chronologically
- **Natural Language Search**: Ask questions like "Show my AI projects" or "Find internship documents"

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: SQLite
- **Vector Store**: ChromaDB
- **AI**: Google Gemini 2.5 Flash

## Quick Start

See `docs/setup.md` for detailed setup instructions.

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project Structure

- `backend/` - Python FastAPI server
- `frontend/` - React web app
- `docs/` - Documentation
- `logs/` - Development logs
