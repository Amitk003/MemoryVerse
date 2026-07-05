from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "other"
    date_of_document: Optional[datetime] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    file_name: str
    file_type: str
    file_size: int
    extracted_text: Optional[str] = ""
    is_indexed: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentResponse


class RelationshipResponse(BaseModel):
    id: int
    source_document_id: int
    target_document_id: int
    relationship_type: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SearchResult(BaseModel):
    document: DocumentResponse
    score: float
    matched_content: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


class TimelineItem(BaseModel):
    year: int
    title: str
    category: str
    document_id: int
    description: str


class TimelineResponse(BaseModel):
    items: list[TimelineItem]
