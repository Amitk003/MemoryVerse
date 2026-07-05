# feat-ingestion Log

## Branch Setup
- git checkout master
- git checkout -b feat-ingestion
- git checkout backend-core -- backend/ docs/ logs/ .gitignore

## API Endpoints Created
- POST /api/v1/documents/upload - Upload a file (validates type, saves with UUID name, extracts text, stores metadata)
- GET /api/v1/documents/ - List documents (supports category filter, pagination)
- GET /api/v1/documents/{id} - Get single document by ID
- DELETE /api/v1/documents/{id} - Delete document (removes file from disk + DB record)

## Files Changed
- backend/app/api/v1/documents.py - Full CRUD implementation
- backend/app/core/gemini.py - Lazy initialization (doesn't crash on startup without API key)

## Tests Run (via FastAPI TestClient)
- Health endpoint: OK
- Empty list: OK
- Upload text file: OK (UUID filename, text extraction, metadata saved)
- List after upload: OK (1 document)
- Get by ID: OK
- Get non-existent: 404 - OK
- Delete: OK
- List after delete: empty - OK
