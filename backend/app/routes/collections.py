from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.storage import (
    get_collections,
    create_collection,
    delete_collection,
    get_summaries,
    get_summary,
    delete_summary,
)

router = APIRouter(prefix="/api", tags=["data"])


class CollectionCreate(BaseModel):
    name: str


@router.get("/collections")
async def list_collections():
    return get_collections()


@router.post("/collections")
async def new_collection(req: CollectionCreate):
    return create_collection(req.name)


@router.delete("/collections/{collection_id}")
async def remove_collection(collection_id: str):
    if not delete_collection(collection_id):
        raise HTTPException(status_code=404, detail="Collection not found.")
    return {"ok": True}


@router.get("/summaries")
async def list_summaries(
    collection_id: str | None = Query(None),
    search: str | None = Query(None),
):
    return get_summaries(collection_id=collection_id, search=search)


@router.get("/summaries/{summary_id}")
async def read_summary(summary_id: str):
    record = get_summary(summary_id)
    if not record:
        raise HTTPException(status_code=404, detail="Summary not found.")
    return record


@router.delete("/summaries/{summary_id}")
async def remove_summary(summary_id: str):
    if not delete_summary(summary_id):
        raise HTTPException(status_code=404, detail="Summary not found.")
    return {"ok": True}
