from google import genai

from app.core.config import settings


class GeminiClient:
    def __init__(self):
        self._initialized = False
        self._client = None
        self.embedding_model = "models/embedding-001"

    def _ensure_initialized(self):
        if not self._initialized:
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY or None)
            self._initialized = True

    def generate_text(self, prompt: str) -> str:
        self._ensure_initialized()
        response = self._client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        return response.text

    def generate_embedding(self, text: str) -> list[float]:
        self._ensure_initialized()
        result = self._client.models.embed_content(
            model=self.embedding_model,
            contents=text,
        )
        return result.embeddings[0].values


gemini_client = GeminiClient()
