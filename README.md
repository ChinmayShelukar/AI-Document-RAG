# 📄 AI Document RAG

A document Q&A application built on Retrieval-Augmented Generation (RAG). Upload a
document, then ask questions about it in natural language and get answers grounded
in that document's contents.

Reworked from an open-source clone into a portfolio project: the stack was moved
off local models onto fully hosted APIs so it runs on free-tier infrastructure.

## Architecture

Three services, one request flow:

```
React (5173)  →  Spring API (8080, /api/v1)  →  RAG server (5000)  →  Groq / Gemini
```

- **Frontend** — React 19 + TypeScript + Vite + MUI.
- **Spring API** — Spring Boot 3.5 / Java 21, multi-module Maven (hexagonal:
  `domain` + `framework`). REST + JWT auth via an HttpOnly cookie. Proxies to the
  RAG server; never talks to the LLM directly.
- **RAG server** — Python FastAPI + LlamaIndex. **Groq** for the LLM, **Google
  Gemini** for embeddings — both hosted APIs, no local torch/GPU.

The RAG index holds only the most recently uploaded document (rebuilt on each
upload), so answers never bleed across documents. In-memory; resets on restart.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, Material UI |
| API | Java 21, Spring Boot, Spring Security, PostgreSQL |
| RAG | Python, FastAPI, LlamaIndex, Groq (LLM), Gemini (embeddings) |
| Infra | Docker, Neon (Postgres), Render, Vercel |

## Running locally

Each service runs independently. See `CLAUDE.md` for exact commands and the H2
override that lets the API run without a local Postgres.

- **RAG server**: `cd backend/rag-server && uvicorn app:app --host 0.0.0.0 --port 5000`
  (reads `config/.env` — see `backend/rag-server/README.md` for required keys)
- **Spring API**: `cd backend && mvn clean package -DskipTests` then run the
  `framework` jar (env-var driven config, see `CLAUDE.md`)
- **Frontend**: `cd frontend && npm run dev` (needs `frontend/.env` →
  `VITE_API_URL=http://localhost:8080/api/v1`)

API docs (Swagger): `http://localhost:8080/swagger-ui.html`
