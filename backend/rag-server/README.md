---
title: AI Document RAG Server
emoji: 📄
colorFrom: blue
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# AI Document RAG — Server

FastAPI + LlamaIndex RAG server for the **AI Document RAG** project. Local
HuggingFace embeddings + Groq-hosted LLM. Scopes answers to the most recently
uploaded document.

## Endpoints
- `POST /agent/respond` — `{ "message": "..." }` → `{ "answer": "..." }`
- `POST /documents/ingest` — multipart `file` → `{ "filename", "chunks" }`

## Required Space secrets/variables
| Key | Example |
|-----|---------|
| `GROQ_API_KEY` | `gsk_...` (from console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` |
| `DOCUMENTS_DIR` | `data` |

Runs on port 7860 (HF Spaces Docker default).
