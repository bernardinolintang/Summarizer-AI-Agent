from groq import Groq
from app.config import get_settings

_groq: Groq | None = None


def get_groq() -> Groq:
    global _groq
    if _groq is None:
        s = get_settings()
        _groq = Groq(api_key=s.groq_api_key)
    return _groq
