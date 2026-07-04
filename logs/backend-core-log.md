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

## Code Review Fixes (7 issues)
1. classifier.py - Replaced brittle strip() with regex json extraction
2. engine.py - Replaced brittle strip() with regex json extraction
3. parser.py - Fixed path traversal: UUID filenames instead of user-supplied names. OCR failure returns empty string instead of placeholders
4. document.py - Added ForeignKey("documents.id", ondelete="CASCADE") on source_document_id and target_document_id
5. chroma.py - Added empty results guard before accessing results["ids"][0]
6. engine.py - Added description and extracted_text to relationship prompts for better context
7. parser.py - save_file returns (path, safe_name) tuple instead of just path

## Second Round of Review Fixes (3 issues)
1. database.py - Added @event.listens_for(Engine, "connect") to execute PRAGMA foreign_keys=ON (SQLite needs this explicitly)
2. parser.py - Fixed return type hint from -> str to -> Tuple[str, str]
3. document.py - Added ORM relationship() mappings with cascade="all, delete-orphan" for both source and target sides
