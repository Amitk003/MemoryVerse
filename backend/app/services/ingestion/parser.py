import os
from pathlib import Path
from typing import Optional

from app.core.config import settings


class FileParser:
    SUPPORTED_EXTENSIONS = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
    }

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, file_name: str) -> str:
        file_path = self.upload_dir / file_name
        with open(file_path, "wb") as f:
            f.write(file_content)
        return str(file_path)

    def extract_text(self, file_path: str, file_type: str) -> str:
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return self._extract_pdf_text(file_path)
        elif ext in [".png", ".jpg", ".jpeg"]:
            return self._extract_image_text(file_path)
        elif ext == ".txt":
            return self._extract_txt_text(file_path)
        elif ext == ".docx":
            return self._extract_docx_text(file_path)
        return ""

    def _extract_pdf_text(self, file_path: str) -> str:
        import fitz
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        return text

    def _extract_image_text(self, file_path: str) -> str:
        try:
            import pytesseract
            from PIL import Image
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception:
            return "[OCR not available - install pytesseract]"

    def _extract_txt_text(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    def _extract_docx_text(self, file_path: str) -> str:
        try:
            from docx import Document
            doc = Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        except ImportError:
            return "[DOCX parsing not available]"

    def get_file_type(self, file_name: str) -> str:
        ext = Path(file_name).suffix.lower()
        return self.SUPPORTED_EXTENSIONS.get(ext, "application/octet-stream")


file_parser = FileParser()
