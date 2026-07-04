from app.core.gemini import gemini_client


class RelationshipEngine:
    def find_relationships(self, all_documents: list[dict]) -> list[dict]:
        doc_summaries = []
        for doc in all_documents:
            doc_summaries.append(f"ID: {doc['id']}, Title: {doc['title']}, Category: {doc['category']}")

        docs_text = "\n".join(doc_summaries)

        prompt = f"""
You are a relationship discovery engine. Given the list of documents below,
find meaningful connections between them.

Possible relationship types:
- certification_to_skill
- skill_to_project
- project_to_internship
- internship_to_career
- project_to_achievement
- academic_to_project
- other

Return a JSON array of relationships. Each relationship must have:
- "source_id": document id
- "target_id": document id
- "type": relationship type
- "description": short explanation (max 30 words)

Documents:
{docs_text}
"""

        try:
            response = gemini_client.generate_text(prompt)
            import json
            cleaned = response.strip().strip("```json").strip("```").strip()
            return json.loads(cleaned)
        except Exception:
            return []


relationship_engine = RelationshipEngine()
