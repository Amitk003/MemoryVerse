import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db

logger = logging.getLogger(__name__)
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


CATEGORY_KEYWORDS = {
    "project": ["project", "projects"],
    "skill": ["skill", "skills"],
    "certification": ["certification", "certifications", "certificate", "certificates"],
    "internship": ["internship", "internships", "intern"],
    "achievement": ["achievement", "achievements", "award", "awards"],
    "academics": ["academic", "academics", "education", "course", "courses", "college", "university"],
}


@router.get("/search", response_model=SearchResponse)
def search_documents(
    q: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not q.strip():
        return SearchResponse(query=q, results=[])

    try:
        query_lower = q.lower()
        matched_categories = set()
        for cat, keywords in CATEGORY_KEYWORDS.items():
            if any(kw in query_lower for kw in keywords):
                matched_categories.add(cat)

        chroma_results = searcher.semantic_search(
            q,
            top_k=50,
            where_filter={"user_id": str(user.id)},
        )

        seen_ids = set()
        seen_scores = {}
        for cr in chroma_results:
            doc_id = int(cr["id"])
            seen_ids.add(doc_id)
            seen_scores[doc_id] = max(0.0, 1.0 - cr.get("score", 0))

        if matched_categories:
            query = db.query(Document).filter(
                Document.user_id == user.id,
                Document.category.in_([cat for cat in matched_categories]),
            )
            if seen_ids:
                query = query.filter(~Document.id.in_(seen_ids))
            extra_docs = query.all()
            for d in extra_docs:
                seen_ids.add(d.id)
                seen_scores[d.id] = 0.0

        doc_objects = db.query(Document).filter(
            Document.id.in_(seen_ids),
            Document.user_id == user.id,
        ).all()
        doc_map = {d.id: d for d in doc_objects}

        results = []
        for doc_id in seen_ids:
            doc = doc_map.get(doc_id)
            if not doc:
                continue
            score = seen_scores[doc_id]
            if matched_categories:
                doc_cat = doc.category.value if doc.category else "other"
                if doc_cat in matched_categories:
                    score += 0.5
            results.append(SearchResult(
                document=DocumentResponse.model_validate(doc),
                score=min(score, 1.0),
                matched_content="",
            ))

        results.sort(key=lambda r: r.score, reverse=True)

        return SearchResponse(query=q, results=results[:20])

    except Exception as e:
        logger.error("Semantic search failed for query '%s': %s", q, e)
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
