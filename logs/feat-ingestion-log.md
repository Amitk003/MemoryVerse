# feat-ingestion Log

## Branch Setup
- git checkout master
- git checkout -b feat-ingestion
- git checkout backend-core -- backend/ docs/ logs/ .gitignore

## API Endpoints
- POST /api/v1/documents/upload - Upload with full pipeline (classify + embedding + ChromaDB index + background relationship discovery)
- GET /api/v1/documents/ - List documents (category filter, pagination)
- GET /api/v1/documents/{id} - Get single document
- DELETE /api/v1/documents/{id} - Delete document + file + ChromaDB embedding
- GET /api/v1/documents/{id}/relationships - Get relationships for a document
- GET /api/v1/search?q= - Semantic search via ChromaDB
- GET /api/v1/timeline - Chronological timeline

## Files Changed
- backend/app/api/v1/documents.py - Full CRUD + classification + embedding indexing + relationship discovery + file leak protection
- backend/app/api/v1/search.py - New file: search and timeline endpoints
- backend/app/main.py - Registered search router
- backend/app/core/gemini.py - Lazy initialization

## Code Review Fixes
1. Upload pipeline now calls classifier.classify(), generates embedding, stores in ChromaDB, triggers relationship discovery via BackgroundTasks
2. Delete now calls vector_store.delete_document() to remove ChromaDB embedding (no ghost results)
3. Added /search, /timeline, /documents/{id}/relationships endpoints
4. File leak protection: try/except wraps DB+extraction, cleans up file on failure

## Tests Run (11 tests, all pass)
- Health: OK
- Upload with classification: OK (category assigned)
- List after upload: OK
- Get by ID: OK
- Search endpoint: OK (0 results without API key, not crashing)
- Timeline endpoint: OK (1 item)
- Relationships endpoint: OK
- Delete: OK
- Ghost search after delete: OK (no ghost results)
- Unsupported file type rejected: 400 - OK
- Non-existent doc: 404 - OK
