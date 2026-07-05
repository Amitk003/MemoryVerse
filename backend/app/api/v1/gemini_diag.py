import logging

from fastapi import APIRouter

from app.core.gemini import gemini_client
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["diagnostics"])


@router.get("/test-gemini")
def test_gemini():
    if not settings.GEMINI_API_KEY:
        return {
            "status": "skipped",
            "message": "GEMINI_API_KEY is not set",
        }

    results = {}
    all_ok = True

    try:
        gemini_client._ensure_initialized()
        results["init"] = "ok"
    except Exception as e:
        results["init"] = f"failed: {e}"
        all_ok = False

    try:
        text = gemini_client.generate_text("Say 'Hello' in one word.")
        results["text_generation"] = f"ok (response: {text})"
    except Exception as e:
        results["text_generation"] = f"failed: {e}"
        all_ok = False

    try:
        emb = gemini_client.generate_embedding("test")
        results["embedding"] = f"ok (dimension: {len(emb)})"
    except Exception as e:
        results["embedding"] = f"failed: {e}"
        all_ok = False

    return {
        "status": "ok" if all_ok else "partial",
        "results": results,
    }
