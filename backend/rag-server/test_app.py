"""Fast, offline tests for the RAG server — no Groq/Gemini calls, no API keys.

Covers the logic the frontend depends on:
- upload validation guards (unsupported extension, oversized file)
- /agent/respond response shape (answer + sources filtered by confidence + tokens)
- "no document yet" path

The LlamaIndex query engine is mocked, so these assert OUR code (params, guards,
source filtering, token diffing) without touching the network.
"""
import io
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

import app as app_module
from app import app

client = TestClient(app)


# --- upload validation guards (no LLM involved) ---

def test_ingest_rejects_unsupported_extension():
    r = client.post(
        "/documents/ingest",
        files={"file": ("evil.xyz", b"junk", "application/octet-stream")},
    )
    assert r.status_code == 400
    assert "Unsupported file type" in r.json()["detail"]


def test_ingest_rejects_oversized_file():
    big = b"x" * (10 * 1024 * 1024 + 1)  # just over 10MB
    with patch("app.ingest_file") as ingest:
        r = client.post(
            "/documents/ingest",
            files={"file": ("big.txt", io.BytesIO(big), "text/plain")},
        )
    assert r.status_code == 400
    assert "10MB" in r.json()["detail"]
    ingest.assert_not_called()  # never reaches indexing


def test_ingest_accepts_supported_file_and_returns_chunk_count():
    with patch("app.ingest_file", return_value=3) as ingest:
        r = client.post(
            "/documents/ingest",
            files={"file": ("doc.txt", b"hello world", "text/plain")},
            data={"chunk_size": "300", "chunk_overlap": "30"},
        )
    assert r.status_code == 200
    assert r.json() == {"filename": "doc.txt", "chunks": 3}
    # chunk params are forwarded to ingest_file
    _, kwargs = ingest.call_args
    assert kwargs["chunk_size"] == 300 and kwargs["chunk_overlap"] == 30


# --- /agent/respond response shape ---

def test_respond_no_document_returns_empty_sources():
    with patch("app.get_query_engine", return_value=None):
        r = client.post("/agent/respond", json={"message": "hi"})
    body = r.json()
    assert r.status_code == 200
    assert "upload a document" in body["answer"].lower()
    assert body["sources"] == []
    assert body["tokens"] == {"prompt": 0, "completion": 0, "embedding": 0}


def test_respond_returns_answer_sources_and_tokens():
    # Fake source nodes: one above, one below the confidence threshold.
    def node(text, score):
        inner = SimpleNamespace(
            get_content=lambda: text,
            metadata={"file_name": "doc.txt"},
        )
        return SimpleNamespace(node=inner, score=score)

    fake_response = SimpleNamespace(
        source_nodes=[node("high relevance", 0.9), node("low relevance", 0.1)],
    )

    class FakeEngine:
        async def aquery(self, _msg):
            # str(response) must yield the answer text, like a real LlamaIndex Response
            class R:
                source_nodes = fake_response.source_nodes
                def __str__(self):
                    return "the answer"
            return R()

    # token_snapshot returns a low value first (before), higher after → diff is the usage
    snapshots = iter([
        {"prompt": 100, "completion": 0, "embedding": 5},
        {"prompt": 150, "completion": 20, "embedding": 8},
    ])
    with patch("app.get_query_engine", return_value=FakeEngine()), \
         patch("app.token_snapshot", side_effect=lambda: next(snapshots)):
        r = client.post(
            "/agent/respond",
            json={"message": "q", "top_k": 3, "confidence_threshold": 0.5},
        )

    body = r.json()
    assert body["answer"] == "the answer"
    # only the source above the 0.5 threshold survives
    assert len(body["sources"]) == 1
    assert body["sources"][0]["score"] == 0.9
    assert body["sources"][0]["file"] == "doc.txt"
    # tokens are the diff between the two snapshots
    assert body["tokens"] == {"prompt": 50, "completion": 20, "embedding": 3}


# --- allowlist sanity ---

def test_model_allowlist_populated():
    import agent
    assert "llama-3.3-70b-versatile" in agent.ALLOWED_MODELS
    assert all(m for m in agent.ALLOWED_MODELS)  # no empty entries
