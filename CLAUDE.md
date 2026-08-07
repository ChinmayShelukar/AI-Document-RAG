# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth for project state

`HANDOFF.md` (gitignored) holds live project state: what's committed, what's in
flight, deployment status, secret locations, and the next action. Read it first.
`README.md` is stale upstream-fork docs (Portuguese, Ollama/LangChain) — do not
trust it for architecture; the app was reworked to Groq LLM + Gemini embeddings.

## Three services, one flow

React (5173) → Spring API (8080, `/api/v1/...`) → RAG server (5000) → Groq/Gemini.

- **Frontend** (`frontend/`): React 19 + TS + Vite + MUI, BMW M design theme.
- **Spring API** (`backend/`): Spring Boot 3.5 / Java 21, multi-module Maven.
- **RAG server** (`backend/rag-server/`): FastAPI + LlamaIndex. Groq LLM +
  Gemini embeddings — both hosted APIs, no local torch/GPU (keeps it under
  Render's free 512MB).

Spring never talks to Groq/Gemini directly — it proxies to the RAG server via
`RestTemplate` in `ChatBotClientImpl`: `/agent/respond` for questions,
`/documents/ingest` (multipart) for uploads.

## Non-obvious architecture

- **Spring backend is hexagonal**, split across two Maven modules:
  - `domain/` — pure business logic, no Spring web deps. Ports are interfaces
    here (e.g. `client/ChatBotClient`, `repository/UserRepository`).
  - `framework/` — the deployable Spring Boot app (`Application.java` lives
    here). Adapters implement the domain ports: controllers under
    `adapter/controller`, the RAG client `driver/client/ChatBotClientImpl`, the
    JPA repo `driver/client/UserRepositoryOrm`. Package root is
    `com.aidocrag` (`com.aidocrag.auditoria.api` in `framework`).
  - Only `framework` produces the runnable jar; `domain` is a library dep.
- **RAG index holds only the most recently uploaded document.** Each upload
  rebuilds a fresh in-memory `VectorStoreIndex` (`agent.py: ingest_file`), so
  answers never bleed across docs. No persistence — resets on restart. Single
  global `index`, not per-user (see the `ponytail:` note in `agent.py`).
- **Auth is JWT in an HttpOnly `token` cookie**, not a Bearer header.
  `SecurityFilter` reads the cookie; frontend axios uses `withCredentials: true`.
  Cookie `Secure`/`SameSite` are env-driven (`COOKIE_SECURE`, `COOKIE_SAME_SITE`)
  for cross-origin HTTPS (Vercel + Render).
- **Upload Content-Type trap**: axios forces `application/json` globally, so
  upload calls must override with `Content-Type: undefined`
  (`ChatBot.tsx`) to let the browser set the multipart boundary.

## Commands

**RAG server** (venv has deps, reads `config/.env`):
```
cd backend/rag-server && ./venv/bin/uvicorn app:app --host 0.0.0.0 --port 5000
```

**Spring API** — needs no local Postgres; override to H2 in-memory:
```
cd backend && H2=$(find ~/.m2 -name 'h2-2.2.224.jar' | head -1)
export POSTGRES_URL="jdbc:h2:mem:test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1" POSTGRES_USER=sa POSTGRES_PASSWORD="" \
  JWT_SECRET="testsecrettestsecrettestsecret123456" JWT_ISSUER="aidocrag" JWT_EXPIRATION_HOURS=24 \
  ALLOWED_ORIGINS="http://localhost:5173" RAG_API_URL="http://localhost:5000" COOKIE_SECURE=false COOKIE_SAME_SITE=Lax
mvn clean package -DskipTests
java -cp "framework/target/framework-0.0.1-SNAPSHOT.jar:$H2" -Dloader.path="$H2" \
  -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect \
  org.springframework.boot.loader.launch.PropertiesLauncher
```
Production uses Postgres (Neon); all config in `application.properties` is
env-var driven with no local fallbacks except cookie flags and `PORT`.

**Frontend** (`frontend/`): `npm run dev` · `npm run build` (runs `tsc -b`
first) · `npm run lint` (eslint). Needs `frontend/.env` →
`VITE_API_URL=http://localhost:8080/api/v1`.

## Gotchas

- **Background processes get reaped in this harness** — start a server AND run
  its test in ONE command, or the process dies before you can curl it.
- Gemini embedding model MUST be `models/gemini-embedding-001` (old
  `models/embedding-001` 404s on v1beta).
- Free tiers (Neon/Render/Vercel) sleep when idle → ~30-50s cold start. Warm up
  before a demo.
- No test suite exists in any of the three services. Spring builds with
  `-DskipTests` because there are none.
