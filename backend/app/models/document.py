from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class CategoryEnum(str, enum.Enum):
    PROJECT = "project"
    SKILL = "skill"
    CERTIFICATION = "certification"
    INTERNSHIP = "internship"
    ACHIEVEMENT = "achievement"
    ACADEMICS = "academics"
    OTHER = "other"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    category = Column(SAEnum(CategoryEnum), default=CategoryEnum.OTHER)
    description = Column(Text, default="")
    extracted_text = Column(Text, default="")
    date_of_document = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, nullable=True)

    source_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.source_document_id",
        back_populates="source_document",
        cascade="all, delete-orphan",
    )
    target_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.target_document_id",
        back_populates="target_document",
        cascade="all, delete-orphan",
    )


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    target_document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(100), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    source_document = relationship("Document", foreign_keys=[source_document_id], back_populates="source_relationships")
    target_document = relationship("Document", foreign_keys=[target_document_id], back_populates="target_relationships")
