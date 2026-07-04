# frontend-core Log

## Git Setup
- git checkout master
- git checkout -b frontend-core

## Dependencies Installed
- npm create vite@latest frontend --template react-ts
- npm install react-router-dom axios lucide-react date-fns
- npm install -D tailwindcss @tailwindcss/vite

## Files Created / Modified
- frontend/vite.config.ts - Added Tailwind v4 plugin + API proxy to localhost:8000
- frontend/src/index.css - Tailwind v4 import (@import "tailwindcss")
- frontend/src/types/index.ts - TypeScript types (Document, Relationship, SearchResult, TimelineItem, CATEGORIES, CATEGORY_COLORS)
- frontend/src/services/api.ts - Axios client with all API endpoints
- frontend/src/layouts/MainLayout.tsx - Responsive sidebar layout with nav links (Dashboard, Upload, Search, Timeline)
- frontend/src/pages/Dashboard.tsx - Category cards, recent documents list, empty state
- frontend/src/pages/Upload.tsx - Drag-drop zone, file list, upload button
- frontend/src/pages/Search.tsx - Search input, results display with score
- frontend/src/pages/Timeline.tsx - Year-grouped timeline with dot indicators
- frontend/src/App.tsx - React Router setup (/, /upload, /search, /timeline)

## Files Removed
- src/App.css - Replaced with Tailwind
- src/assets/ - Default Vite assets removed

## Build Output
- tsc + vite build succeeds
- Output: dist/ (index.html, CSS 18KB, JS 291KB)

## Code Review Fixes (4 issues)
1. api.ts / Upload.tsx / Search.tsx / Timeline.tsx - All pages now use documentsApi instead of raw fetch()
2. Search.tsx - Replaced any[] with SearchResult[] type from types/index.ts
3. Timeline.tsx - Removed duplicate TimelineItem interface, imported from types/index.ts
4. Upload.tsx - Added file validation (max 10MB, allowed extensions check) on both input and drag-drop. Parallel uploads via Promise.allSettled with per-file success/error status tracking
