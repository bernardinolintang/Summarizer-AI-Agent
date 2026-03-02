import logging
from uuid import uuid4
from datetime import datetime, timezone
from app.database import get_db

logger = logging.getLogger(__name__)


def _row_to_dict(row) -> dict:
    return dict(row) if row else {}


# ── Summaries ────────────────────────────────────────────────────────

def create_summary(
    source_type: str,
    source_name: str,
    original_text: str,
    summary: str,
    collection_id: str | None = None,
) -> dict:
    db = get_db()
    row = {
        "id": str(uuid4()),
        "source_type": source_type,
        "source_name": source_name,
        "original_text": original_text[:50_000],
        "summary": summary,
        "collection_id": collection_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.execute(
        """INSERT INTO summaries (id, source_type, source_name, original_text, summary, collection_id, created_at)
           VALUES (:id, :source_type, :source_name, :original_text, :summary, :collection_id, :created_at)""",
        row,
    )
    db.commit()
    return row


def get_summaries(collection_id: str | None = None, search: str | None = None) -> list[dict]:
    db = get_db()
    query = "SELECT * FROM summaries"
    params: list = []
    clauses: list[str] = []

    if collection_id:
        clauses.append("collection_id = ?")
        params.append(collection_id)
    if search:
        clauses.append("(summary LIKE ? OR source_name LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])

    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY created_at DESC"

    rows = db.execute(query, params).fetchall()
    return [_row_to_dict(r) for r in rows]


def get_summary(summary_id: str) -> dict | None:
    db = get_db()
    row = db.execute("SELECT * FROM summaries WHERE id = ?", (summary_id,)).fetchone()
    return _row_to_dict(row) if row else None


def delete_summary(summary_id: str) -> bool:
    db = get_db()
    cursor = db.execute("DELETE FROM summaries WHERE id = ?", (summary_id,))
    db.commit()
    return cursor.rowcount > 0


# ── Collections ──────────────────────────────────────────────────────

def create_collection(name: str) -> dict:
    db = get_db()
    row = {
        "id": str(uuid4()),
        "name": name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.execute(
        "INSERT INTO collections (id, name, created_at) VALUES (:id, :name, :created_at)",
        row,
    )
    db.commit()
    return row


def get_collections() -> list[dict]:
    db = get_db()
    rows = db.execute("SELECT * FROM collections ORDER BY created_at DESC").fetchall()
    return [_row_to_dict(r) for r in rows]


def delete_collection(collection_id: str) -> bool:
    db = get_db()
    cursor = db.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
    db.commit()
    return cursor.rowcount > 0
