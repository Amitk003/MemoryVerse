from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "MemoryVerse API is running"}
