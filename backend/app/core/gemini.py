import google.generativeai as genai

from app.core.config import settings


class GeminiClient:
    def __init__(self):
        self._initialized = False
        self._model = None
        self.embedding_model = "models/embedding-001"

    def _ensure_initialized(self):
        if not self._initialized:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(settings.GEMINI_MODEL)
            self._initialized = True

    def generate_text(self, prompt: str) -> str:
        self._ensure_initialized()
        response = self._model.generate_content(prompt)
        return response.text

    def generate_embedding(self, text: str) -> list[float]:
        result = genai.embed_content(
            model=self.embedding_model,
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]


gemini_client = GeminiClient()
