import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.document import Document, CategoryEnum
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.ingestion.parser import file_parser

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "MemoryVerse API is running"}


@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
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

    extracted_text = file_parser.extract_text(file_path, file.content_type or "")

    doc = Document(
        title=file.filename,
        file_name=safe_name,
        file_path=file_path,
        file_type=file.content_type or file_parser.get_file_type(file.filename),
        file_size=len(content),
        extracted_text=extracted_text,
        category=CategoryEnum.OTHER,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentUploadResponse(
        message="Document uploaded successfully",
        document=DocumentResponse.model_validate(doc),
    )


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

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
