import logging
import re
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

logger = logging.getLogger(__name__)

YOUTUBE_URL_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
]

_api = YouTubeTranscriptApi()


def extract_video_id(url: str) -> str | None:
    for pattern in YOUTUBE_URL_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_transcript(url: str) -> str:
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {url}")

    try:
        transcript = _api.fetch(video_id)
    except TranscriptsDisabled:
        raise ValueError("Transcripts are disabled for this video.")
    except NoTranscriptFound:
        try:
            transcript_list = _api.list(video_id)
            generated = transcript_list.find_generated_transcript(["en"])
            transcript = generated.fetch()
        except Exception:
            raise ValueError(
                "No transcript available for this video (manual or auto-generated)."
            )
    except VideoUnavailable:
        raise ValueError("This video is unavailable or private.")

    text = " ".join(snippet.text for snippet in transcript)
    return text
