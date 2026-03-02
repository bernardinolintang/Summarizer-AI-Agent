import io
import logging
from PyPDF2 import PdfReader
from docx import Document
from PIL import Image

logger = logging.getLogger(__name__)

HAS_TESSERACT = False
try:
    import pytesseract

    HAS_TESSERACT = True
except Exception:
    logger.warning("pytesseract unavailable — OCR disabled")

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text and text.strip():
            pages.append(text.strip())

    if pages:
        return "\n\n".join(pages)

    # Fallback: attempt OCR on each page image (requires pdf2image + tesseract)
    if HAS_TESSERACT:
        logger.info("PDF text extraction empty — attempting OCR fallback")
        return _ocr_pdf_bytes(file_bytes)

    raise ValueError("PDF has no extractable text and OCR is unavailable.")


def _ocr_pdf_bytes(file_bytes: bytes) -> str:
    try:
        from pdf2image import convert_from_bytes

        images = convert_from_bytes(file_bytes, dpi=300)
        texts = [pytesseract.image_to_string(img) for img in images]
        combined = "\n\n".join(t.strip() for t in texts if t.strip())
        if not combined:
            raise ValueError("OCR produced no text from PDF.")
        return combined
    except ImportError:
        raise ValueError("pdf2image is required for OCR fallback on scanned PDFs.")


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    if not paragraphs:
        raise ValueError("DOCX file contains no extractable text.")
    return "\n\n".join(paragraphs)


def extract_text_from_image(file_bytes: bytes) -> str:
    if not HAS_TESSERACT:
        raise ValueError("OCR is not available (pytesseract not installed).")
    image = Image.open(io.BytesIO(file_bytes))
    text = pytesseract.image_to_string(image)
    if not text.strip():
        raise ValueError("OCR produced no readable text from the image.")
    return text.strip()


def extract_text(filename: str, file_bytes: bytes) -> str:
    ext = _get_extension(filename)
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")

    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_bytes)
    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp"):
        return extract_text_from_image(file_bytes)
    else:
        raise ValueError(f"No handler for extension: {ext}")


def _get_extension(filename: str) -> str:
    import os
    return os.path.splitext(filename)[1].lower()
