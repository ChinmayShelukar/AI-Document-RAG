"""Pytest fixtures. Sets dummy API keys BEFORE app/agent import so the suite runs
with no real Groq/Gemini keys and makes no network calls. python-dotenv's
load_dotenv (override=False) won't clobber these, so config/.env is ignored here.
"""
import os

os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("GOOGLE_API_KEY", "test-google-key")
os.environ.setdefault("GROQ_MODEL", "llama-3.3-70b-versatile")
os.environ.setdefault("EMBEDDING_MODEL", "models/gemini-embedding-001")
os.environ.setdefault("DOCUMENTS_DIR", "data")
