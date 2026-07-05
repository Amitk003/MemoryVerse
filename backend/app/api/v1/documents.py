import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db, retry_on_lock
from app.core.gemini import gemini_client
from app.models.document import Document, CategoryEnum, Relationship
from app.schemas.document import (
    DocumentResponse,
    DocumentUploadResponse,
    RelationshipResponse,
)
from app.services.ingestion.parser import file_parser
from app.services.categorization.classifier import classifier
from app.services.vector_store.chroma import vector_store
from app.services.relationships.engine import relationship_engine

router = APIRouter(prefix="/documents", tags=["documents"])


def _discover_relationships(doc_id: int):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        new_doc = db.query(Document).filter(Document.id == doc_id).first()
        if not new_doc:
            return

        text_for_search = f"{new_doc.title} {new_doc.description or ''} {(new_doc.extracted_text or '')[:500]}"
        try:
            embedding = gemini_client.generate_embedding(text_for_search)
            similar = vector_store.search(embedding, top_k=5)
        except Exception:
            return

        candidate_ids = {int(r["id"]) for r in similar if int(r["id"]) != doc_id}
        if not candidate_ids:
            return

        candidate_docs = db.query(Document).filter(Document.id.in_(candidate_ids)).all()
        if not candidate_docs:
            return

        docs_to_evaluate = [new_doc] + candidate_docs
        docs_data = [
            {
                "id": d.id,
                "title": d.title,
                "category": d.category.value if d.category else "other",
                "description": d.description or "",
                "extracted_text": d.extracted_text or "",
            }
            for d in docs_to_evaluate
        ]

        relations = relationship_engine.find_relationships(docs_data)
        for rel in relations:
            existing = db.query(Relationship).filter(
                Relationship.source_document_id == rel.get("source_id"),
                Relationship.target_document_id == rel.get("target_id"),
                Relationship.relationship_type == rel.get("type"),
            ).first()
            if not existing:
                db.add(Relationship(
                    source_document_id=rel.get("source_id"),
                    target_document_id=rel.get("target_id"),
                    relationship_type=rel.get("type"),
                    description=rel.get("description", ""),
                ))
        _commit_with_retry(db)
    except Exception:
        db.rollback()
    finally:
        db.close()


@retry_on_lock()
def _commit_with_retry(db):
    db.commit()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "MemoryVerse API is running"}


@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    bg_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in file_parser.SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: {list(file_parser.SUPPORTED_EXTENSIONS.keys())}",
        )

    content = file.file.read()
    file_path, safe_name = file_parser.save_file(content, file.filename)

    try:
        extracted_text = file_parser.extract_text(file_path, file.content_type or "")

        category_result = classifier.classify(file.filename, extracted_text)
        category_value = category_result.get("category", "other")

        try:
            category_enum = CategoryEnum(category_value)
        except ValueError:
            category_enum = CategoryEnum.OTHER

        doc = Document(
            title=file.filename,
            file_name=safe_name,
            file_path=file_path,
            file_type=file.content_type or file_parser.get_file_type(file.filename),
            file_size=len(content),
            extracted_text=extracted_text,
            description=category_result.get("reason", ""),
            category=category_enum,
            is_indexed=False,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        try:
            text_for_embedding = f"{doc.title} {doc.description} {extracted_text[:2000]}"
            embedding = gemini_client.generate_embedding(text_for_embedding)
            vector_store.add_document(
                doc_id=str(doc.id),
                embedding=embedding,
                text=text_for_embedding[:2000],
                metadata={
                    "title": doc.title,
                    "category": doc.category.value if doc.category else "other",
                    "file_name": doc.file_name,
                },
            )
            doc.is_indexed = True
            db.commit()
        except Exception:
            doc.is_indexed = False
            db.commit()

        bg_tasks.add_task(_discover_relationships, doc.id)

        return DocumentUploadResponse(
            message="Document uploaded and classified successfully",
            document=DocumentResponse.model_validate(doc),
        )

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Document)
    if category:
        query = query.filter(Document.category == category)
    documents = query.order_by(Document.created_at.desc()).offset(
        (page - 1) * limit
    ).limit(limit).all()
    return [DocumentResponse.model_validate(d) for d in documents]


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    try:
        vector_store.delete_document(str(doc_id))
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}


@router.get("/{doc_id}/relationships", response_model=list[RelationshipResponse])
def get_document_relationships(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    relations = db.query(Relationship).filter(
        (Relationship.source_document_id == doc_id) |
        (Relationship.target_document_id == doc_id)
    ).all()
    return [RelationshipResponse.model_validate(r) for r in relations]
