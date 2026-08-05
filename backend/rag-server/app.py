from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agent import query_engine

app = FastAPI()

class QuestionRequest(BaseModel):
    message: str

@app.post("/agent/respond")
async def ask_question(request: QuestionRequest):
    try:
        response = await query_engine.aquery(request.message)
        return {"answer": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
