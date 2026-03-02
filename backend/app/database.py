import os
import sqlite3
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)

_connection: sqlite3.Connection | None = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS collections (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS summaries (
    id              TEXT PRIMARY KEY,
    source_type     TEXT NOT NULL CHECK (source_type IN ('youtube', 'document', 'text')),
    source_name     TEXT NOT NULL,
    original_text   TEXT NOT NULL,
    summary         TEXT NOT NULL,
    collection_id   TEXT REFERENCES collections(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_summaries_collection ON summaries(collection_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created ON summaries(created_at DESC);
"""


def get_db() -> sqlite3.Connection:
    global _connection
    if _connection is None:
        settings = get_settings()
        db_dir = os.path.dirname(settings.db_path)
        os.makedirs(db_dir, exist_ok=True)

        _connection = sqlite3.connect(settings.db_path, check_same_thread=False)
        _connection.row_factory = sqlite3.Row
        _connection.execute("PRAGMA journal_mode=WAL")
        _connection.execute("PRAGMA foreign_keys=ON")
        _connection.executescript(SCHEMA)
        logger.info(f"SQLite database ready at {settings.db_path}")
    return _connection


def close_db():
    global _connection
    if _connection:
        _connection.close()
        _connection = None
