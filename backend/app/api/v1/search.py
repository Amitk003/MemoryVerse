from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.schemas.document import (
    DocumentResponse,
    SearchResponse,
    SearchResult,
    TimelineResponse,
    TimelineItem,
)
from app.services.retrieval.searcher import searcher

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search_documents(
    q: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not q.strip():
        return SearchResponse(query=q, results=[])

    try:
        chroma_results = searcher.semantic_search(
            q,
            top_k=10,
            filter={"user_id": str(user.id)},
        )

        results = []
        for cr in chroma_results:
            doc_id = int(cr["id"])
            doc = db.query(Document).filter(
                Document.id == doc_id,
                Document.user_id == user.id,
            ).first()
            if doc:
                results.append(SearchResult(
                    document=DocumentResponse.model_validate(doc),
                    score=1.0 - cr.get("score", 0),
                    matched_content=cr.get("text", "")[:300],
                ))

        return SearchResponse(query=q, results=results)

    except Exception:
        return SearchResponse(query=q, results=[])


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    docs = db.query(Document).filter(
        Document.user_id == user.id,
    ).order_by(Document.created_at.asc()).all()

    items = []
    for doc in docs:
        year = doc.date_of_document.year if doc.date_of_document else doc.created_at.year
        items.append(TimelineItem(
            year=year,
            title=doc.title,
            category=doc.category.value if doc.category else "other",
            document_id=doc.id,
            description=doc.description or "",
        ))

    return TimelineResponse(items=items)
