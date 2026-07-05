import logging

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    def __init__(self):
        self._initialized = False
        self._client = None
        self.embedding_model = settings.GEMINI_EMBEDDING_MODEL or "models/gemini-embedding-001"

    def _ensure_initialized(self):
        if not self._initialized:
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY or None)
            self._initialized = True
            logger.info("Gemini client initialized (key set: %s)", bool(settings.GEMINI_API_KEY))

    def generate_text(self, prompt: str) -> str:
        self._ensure_initialized()
        logger.debug("generate_text called, prompt length=%d", len(prompt))
        response = self._client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        logger.debug("generate_text succeeded, response length=%d", len(response.text))
        return response.text

    def generate_embedding(self, text: str) -> list[float]:
        self._ensure_initialized()
        logger.debug("generate_embedding called, text length=%d", len(text))
        result = self._client.models.embed_content(
            model=self.embedding_model,
            contents=text,
        )
        embedding = result.embeddings[0].values
        logger.debug("generate_embedding succeeded, dim=%d", len(embedding))
        return embedding


gemini_client = GeminiClient()
