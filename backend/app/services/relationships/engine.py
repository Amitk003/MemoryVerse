import logging
import re
import json

from app.core.gemini import gemini_client

logger = logging.getLogger(__name__)


class RelationshipEngine:
    def _extract_json(self, text: str) -> str:
        match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return text.strip()

    def find_relationships(self, all_documents: list[dict]) -> list[dict]:
        doc_summaries = []
        for doc in all_documents:
            summary = (
                f"ID: {doc['id']}, "
                f"Title: {doc['title']}, "
                f"Category: {doc['category']}, "
                f"Description: {doc.get('description', '')[:200]}, "
                f"Content: {doc.get('extracted_text', '')[:300]}"
            )
            doc_summaries.append(summary)

        docs_text = "\n---\n".join(doc_summaries)

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
            cleaned = self._extract_json(response)
            return json.loads(cleaned)
        except Exception as e:
            logger.error("Relationship discovery failed: %s", e)
            return []


relationship_engine = RelationshipEngine()
