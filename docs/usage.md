# Usage Guide

## Uploading Documents

1. Click the "Upload" button on the dashboard
2. Select a file (PDF, image, DOCX, or TXT)
3. The system will automatically:
   - Extract text from the file
   - Classify it into a category
   - Save it to the database
   - Create vector embeddings for search

## Searching

Type your query in natural language. Examples:
- "Show all my certificates"
- "Find my AI projects"
- "Show internship documents"
- "Show my latest resume"
- "What did I learn in 2024?"

## Timeline View

The timeline shows all your documents organized by year. This helps you see your growth and achievements over time.

## Categories

The system automatically sorts documents into these categories:
- **Project**: Project reports, code repositories
- **Skill**: Skill certificates, learning records
- **Certification**: Course completion certificates
- **Internship**: Internship letters, offer letters
- **Achievement**: Awards, recognition
- **Academics**: Grades, transcripts, degrees
- **Other**: Documents that don't fit elsewhere

## Relationships

The system connects related documents. For example:
- A Python certification connects to the "Skill" category
- A skill connects to projects that use that skill
- A project connects to an internship where you worked on similar things

## Diagnostics

Visit `GET /api/v1/test-gemini` to verify the Gemini API connection. Returns the status of initialization, text generation, and embedding.
