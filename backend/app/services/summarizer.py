import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from groq import RateLimitError, APIStatusError, InternalServerError, APIConnectionError
from app.clients import get_groq
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert summarizer. Given the following content, provide:

1. **Summary** — A clear, concise summary (3-5 paragraphs).
2. **Key Points** — Bullet list of the most important takeaways.
3. **Action Items** — Any actionable recommendations (if applicable).

Use markdown formatting. Be thorough but concise."""

RETRYABLE_ERRORS = (RateLimitError, InternalServerError, APIConnectionError)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=30),
    retry=retry_if_exception_type(RETRYABLE_ERRORS),
    before_sleep=lambda rs: logger.warning(f"Groq retry attempt {rs.attempt_number}, waiting {rs.next_action.sleep}s"),
)
def generate_summary(content: str, custom_prompt: str | None = None) -> str:
    settings = get_settings()
    client = get_groq()

    prompt = custom_prompt or SYSTEM_PROMPT

    # Truncate content to fit within context window (~6k tokens ≈ 24k chars)
    max_chars = 24_000
    if len(content) > max_chars:
        content = content[:max_chars] + "\n\n[Content truncated due to length]"

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": content},
        ],
        temperature=settings.groq_temperature,
        max_tokens=settings.groq_max_tokens,
    )
    return response.choices[0].message.content
