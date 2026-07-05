import logging

import chromadb
from chromadb.config import Settings

from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self):
        self._initialized = False
        self._client = None
        self._collection = None
        self.collection_name = "memoryverse_documents"

    def _ensure_initialized(self):
        if not self._initialized:
            try:
                self._client = chromadb.PersistentClient(
                    path=settings.CHROMA_PERSIST_DIR,
                    settings=Settings(anonymized_telemetry=False),
                )
                self._collection = self._client.get_or_create_collection(
                    name=self.collection_name,
                    metadata={"hnsw:space": "cosine"},
                )
                self._initialized = True
            except Exception as e:
                logger.error("ChromaDB initialization failed: %s", e)
                raise

    @property
    def collection(self):
        self._ensure_initialized()
        return self._collection

    def add_document(
        self,
        doc_id: str,
        embedding: list[float],
        text: str,
        metadata: dict,
    ):
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata],
        )

    def search(self, query_embedding: list[float], top_k: int = 10, where_filter: Optional[dict] = None) -> list[dict]:
        kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
        }
        if where_filter:
            kwargs["where"] = where_filter
        results = self.collection.query(**kwargs)
        if not results or not results.get("ids") or not results["ids"]:
            return []

        output = []
        for i in range(len(results["ids"][0])):
            output.append({
                "id": results["ids"][0][i],
                "score": results["distances"][0][i] if results.get("distances") else 0,
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
            })
        return output

    def delete_document(self, doc_id: str):
        self.collection.delete(ids=[doc_id])


vector_store = VectorStore()
