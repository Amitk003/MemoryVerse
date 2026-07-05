from typing import Optional

from app.core.gemini import gemini_client
from app.services.vector_store.chroma import vector_store


class Searcher:
    def semantic_search(self, query: str, top_k: int = 10) -> list[dict]:
        query_embedding = gemini_client.generate_embedding(query)
        results = vector_store.search(query_embedding, top_k)
        return results

    def natural_query(self, query: str, documents_context: str) -> str:
        prompt = f"""
You are a smart retrieval assistant. A user asked: "{query}"

Based on their documents, answer their question concisely.
If the information is not available, say so.

Documents:
{documents_context[:3000]}
"""
        try:
            response = gemini_client.generate_text(prompt)
            return response
        except Exception:
            return "Sorry, I could not process your query at this time."


searcher = Searcher()
