import chromadb
from chromadb.config import Settings

from app.core.config import settings


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection_name = "memoryverse_documents"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )

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

    def search(self, query_embedding: list[float], top_k: int = 10) -> list[dict]:
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
        )
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
