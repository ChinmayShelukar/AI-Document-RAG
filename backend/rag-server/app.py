import os
import shutil

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel

from agent import get_query_engine, ingest_file, documents_dir

app = FastAPI()


class QuestionRequest(BaseModel):
    message: str


@app.post("/agent/respond")
async def ask_question(request: QuestionRequest):
    try:
        response = await get_query_engine().aquery(request.message)
        return {"answer": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """Save an uploaded document into DOCUMENTS_DIR and index it for RAG."""
    try:
        os.makedirs(documents_dir, exist_ok=True)
        dest = os.path.join(documents_dir, os.path.basename(file.filename))
        with open(dest, "wb") as out:
            shutil.copyfileobj(file.file, out)

        chunks = ingest_file(dest)
        return {"filename": file.filename, "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
