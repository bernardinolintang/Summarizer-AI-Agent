import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.config import get_settings
from app.services.summarizer import generate_summary
from app.services.youtube import get_transcript
from app.services.document import extract_text
from app.services import storage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["summarize"])


class YouTubeRequest(BaseModel):
    url: str
    collection_id: str | None = None


class TextRequest(BaseModel):
    text: str
    source_name: str = "Manual Input"
    collection_id: str | None = None


def _try_save(source_type, source_name, original_text, summary, collection_id):
    try:
        return storage.create_summary(
            source_type=source_type,
            source_name=source_name,
            original_text=original_text,
            summary=summary,
            collection_id=collection_id,
        )
    except Exception as e:
        logger.warning(f"Failed to save summary: {e}")
        return None


@router.post("/summarize/youtube")
async def summarize_youtube(req: YouTubeRequest):
    try:
        transcript = get_transcript(req.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        summary_text = generate_summary(transcript)
    except Exception as e:
        logger.error(f"Groq summarization failed: {e}")
        raise HTTPException(status_code=502, detail=f"Summarization failed: {e}")

    record = _try_save("youtube", req.url, transcript, summary_text, req.collection_id)
    return {"summary": summary_text, "record": record, "saved": record is not None}


@router.post("/summarize/upload")
async def summarize_upload(
    file: UploadFile = File(...),
    collection_id: str | None = Form(None),
):
    settings = get_settings()
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    file_bytes = await file.read()
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {settings.max_file_size_mb} MB.",
        )

    try:
        text = extract_text(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        summary_text = generate_summary(text)
    except Exception as e:
        logger.error(f"Groq summarization failed: {e}")
        raise HTTPException(status_code=502, detail=f"Summarization failed: {e}")

    record = _try_save("document", file.filename, text, summary_text, collection_id)
    return {"summary": summary_text, "record": record, "saved": record is not None}


@router.post("/summarize/text")
async def summarize_text(req: TextRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text content is empty.")

    try:
        summary_text = generate_summary(req.text)
    except Exception as e:
        logger.error(f"Groq summarization failed: {e}")
        raise HTTPException(status_code=502, detail=f"Summarization failed: {e}")

    record = _try_save("text", req.source_name, req.text, summary_text, req.collection_id)
    return {"summary": summary_text, "record": record, "saved": record is not None}
