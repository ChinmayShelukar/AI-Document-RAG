"""Runnable self-check for the RAG server logic (no network server needed).

Exercises the real ingest → query path against live Groq/Gemini using a tiny
in-memory fixture, and asserts the pieces the frontend depends on: an answer,
at least one scored source, and non-zero token counts. Run:

    ./venv/bin/python test_agent.py

Requires config/.env with GROQ_API_KEY + GOOGLE_API_KEY (same as the server).
"""
import asyncio
import tempfile
import os

import agent


def test_ingest_and_query():
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write("ACME Corp Q3 report. Total revenue was 7.5 million dollars. "
                "The CEO is Jane Doe.\n")
        path = f.name
    try:
        chunks = agent.ingest_file(path, chunk_size=300, chunk_overlap=30)
        assert chunks >= 1, "ingest produced no chunks"

        before = agent.token_snapshot()
        engine = agent.get_query_engine(top_k=3)
        assert engine is not None, "query engine is None after ingest"
        resp = asyncio.run(engine.aquery("What was the total revenue?"))
        after = agent.token_snapshot()

        assert "7.5" in str(resp), f"unexpected answer: {resp}"
        assert len(resp.source_nodes) >= 1, "no source nodes returned"
        assert resp.source_nodes[0].score is not None, "source missing score"
        assert after["prompt"] > before["prompt"], "prompt tokens not counted"
        print("OK: chunks=%d sources=%d tokens=+%d prompt"
              % (chunks, len(resp.source_nodes), after["prompt"] - before["prompt"]))
    finally:
        os.remove(path)


if __name__ == "__main__":
    test_ingest_and_query()
