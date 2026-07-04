# backend-core Log

## Git Setup
- git init
- git remote add origin https://github.com/Amitk003/MemoryVerse.git
- git checkout -b backend-core

## Dependencies Added (requirements.txt)
- fastapi==0.115.6
- uvicorn==0.34.0
- sqlalchemy==2.0.36
- pydantic-settings==2.7.0
- google-generativeai==0.8.3
- chromadb==0.5.23
- PyMuPDF==1.25.2
- python-multipart==0.0.18
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4
- Pillow==11.1.0
- pytesseract==0.3.13
- python-dotenv==1.0.1
- alembic==1.14.0

## Files Created
- backend/.env.example - Environment config template
- backend/app/main.py - FastAPI entry point
- backend/app/core/config.py - Settings management
- backend/app/core/database.py - SQLAlchemy setup
- backend/app/core/gemini.py - Gemini AI client
- backend/app/models/document.py - SQLAlchemy models (Document, Relationship)
- backend/app/schemas/document.py - Pydantic schemas
- backend/app/api/v1/documents.py - Document API routes
- backend/app/services/ingestion/parser.py - File parsing service
- backend/app/services/categorization/classifier.py - Gemini classification
- backend/app/services/relationships/engine.py - Relationship discovery
- backend/app/services/vector_store/chroma.py - ChromaDB wrapper
- backend/app/services/retrieval/searcher.py - Semantic search
- docs/architecture.md - Architecture documentation
- docs/setup.md - Setup guide
- docs/usage.md - Usage guide
- README.md - Project README
