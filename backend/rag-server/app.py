import os
import shutil

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from agent import (
    get_query_engine,
    ingest_file,
    token_snapshot,
    documents_dir,
    SUPPORTED_EXTS,
)

app = FastAPI()

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB


class QuestionRequest(BaseModel):
    message: str
    top_k: int = 5
    model: str | None = None
    confidence_threshold: float = 0.0


@app.post("/agent/respond")
async def ask_question(request: QuestionRequest):
    try:
        query_engine = get_query_engine(top_k=request.top_k, model=request.model)
        if query_engine is None:
            return {
                "answer": "Please upload a document first, then ask questions about it.",
                "sources": [],
                "tokens": {"prompt": 0, "completion": 0, "embedding": 0},
            }

        before = token_snapshot()
        response = await query_engine.aquery(request.message)
        after = token_snapshot()

        sources = []
        for node in getattr(response, "source_nodes", []):
            score = node.score if node.score is not None else 0.0
            if score < request.confidence_threshold:
                continue
            sources.append({
                "text": node.node.get_content()[:500],
                "score": round(float(score), 4),
                "file": node.node.metadata.get("file_name", "document"),
            })

        return {
            "answer": str(response),
            "sources": sources,
            "tokens": {k: after[k] - before[k] for k in after},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    chunk_size: int = Form(500),
    chunk_overlap: int = Form(50),
):
    """Save an uploaded document into DOCUMENTS_DIR and index it for RAG."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in SUPPORTED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(SUPPORTED_EXTS))}",
        )
    try:
        os.makedirs(documents_dir, exist_ok=True)
        dest = os.path.join(documents_dir, os.path.basename(file.filename))
        size = 0
        with open(dest, "wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    out.close()
                    os.remove(dest)
                    raise HTTPException(status_code=400, detail="File exceeds 10MB limit.")
                out.write(chunk)

        chunks = ingest_file(dest, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return {"filename": file.filename, "chunks": chunks}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
