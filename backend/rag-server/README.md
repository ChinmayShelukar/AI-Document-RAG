# AI Document RAG — Server

FastAPI + LlamaIndex RAG server for the **AI Document RAG** project. Fully
API-based (no local ML): **Gemini** for embeddings, **Groq** for the LLM — so it
runs on a small free instance. Scopes answers to the most recently uploaded
document.

## Endpoints
- `POST /agent/respond` — `{ "message": "..." }` → `{ "answer": "..." }`
- `POST /documents/ingest` — multipart `file` → `{ "filename", "chunks" }`

## Required environment variables
| Key | Example |
|-----|---------|
| `GROQ_API_KEY` | `gsk_...` (console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `GOOGLE_API_KEY` | `AIza...` (aistudio.google.com/apikey) |
| `EMBEDDING_MODEL` | `models/gemini-embedding-001` |
| `DOCUMENTS_DIR` | `data` |

## Run locally
```
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 5000
```
Reads config from `config/.env` locally; on a host, set the vars above directly.
