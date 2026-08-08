"""Real-file ingest tests — the coverage that was missing.

Unlike test_app.py (which MOCKS LlamaIndex), these ingest ACTUAL files through
SimpleDirectoryReader + SentenceSplitter and assert the extracted text is real
document text, not raw file bytes. This is exactly the failure that shipped to
prod: llama-index-readers-file hard-imports pandas, and with pandas removed the
reader silently fell back to reading files as bytes (%PDF... → 617 junk chunks).

No API keys / no network: we stop at node splitting and never build a
VectorStoreIndex (which would call Gemini to embed). The extraction + chunking is
where the bug lived, so that's what we assert.
"""
import os

import pytest
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter

from agent import _looks_like_binary, ingest_file

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")

# (filename, a word we expect to find in the cleanly-extracted text)
CASES = [
    ("sample.pdf", "Insurance"),
    ("sample.txt", "quick brown fox"),
    ("sample.md", "Markdown"),
    ("sample.csv", "Alice"),
    ("sample.pptx", "Ponytail"),
    ("sample.xlsx", "accuracy"),
]


@pytest.mark.parametrize("filename,expected_word", CASES)
def test_real_file_extracts_clean_text(filename, expected_word):
    path = os.path.join(FIXTURES, filename)
    docs = SimpleDirectoryReader(input_files=[path]).load_data()
    text = "".join(d.text for d in docs)

    # The bug: reader falls back to raw bytes → text starts with %PDF / PK.
    assert not _looks_like_binary(text), f"{filename} extracted as raw bytes"
    assert expected_word.lower() in text.lower(), (
        f"{filename}: expected '{expected_word}' in extracted text"
    )

    # Chunk count must be sane. The 0.47MB PDF produced 617 GARBAGE chunks when
    # broken; clean it's ~38. Anything in the hundreds for these small fixtures
    # means we're re-embedding byte soup again.
    nodes = SentenceSplitter(chunk_size=500, chunk_overlap=50).get_nodes_from_documents(docs)
    assert 1 <= len(nodes) < 200, f"{filename}: absurd chunk count {len(nodes)}"


def test_ingest_file_rejects_binary_fallback(monkeypatch):
    """If extraction returns raw bytes, ingest_file must raise (not embed garbage)."""
    from types import SimpleNamespace

    def fake_load(self):
        return [SimpleNamespace(text="%PDF-1.7\r\n%\r\n1 0 obj\r\n<</Type/Catalog")]

    monkeypatch.setattr(SimpleDirectoryReader, "load_data", fake_load)
    with pytest.raises(ValueError, match="Could not extract text"):
        ingest_file(os.path.join(FIXTURES, "sample.pdf"))


def test_looks_like_binary():
    assert _looks_like_binary("%PDF-1.7\r\n1 0 obj")
    assert _looks_like_binary("PK\x03\x04\x14\x00garbage")
    assert _looks_like_binary("")
    assert not _looks_like_binary("Medical Insurance Policy 2026\nTable of Contents")
    assert not _looks_like_binary("line1\n\tindented\r\nplenty of readable words here")
