import os
from dotenv import load_dotenv
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.callbacks import CallbackManager, TokenCountingHandler
from llama_index.llms.groq import Groq
from llama_index.embeddings.gemini import GeminiEmbedding

# Path to .env
env_path = Path('.') / 'config' / '.env'
load_dotenv(dotenv_path=env_path)

# Load variables from .env
embedding_model = os.getenv("EMBEDDING_MODEL")
groq_model = os.getenv("GROQ_MODEL")
groq_api_key = os.getenv("GROQ_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")
documents_dir = os.getenv("DOCUMENTS_DIR")

# Groq LLMs the model dropdown may select. Env GROQ_MODEL is the default.
# ponytail: hardcoded allowlist — Groq deprecates models over time, so this is
# the knob to update when a listed model 404s. Add/remove entries here only.
ALLOWED_MODELS = [groq_model, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
ALLOWED_MODELS = [m for i, m in enumerate(ALLOWED_MODELS) if m and m not in ALLOWED_MODELS[:i]]

SUPPORTED_EXTS = {".pdf", ".docx", ".txt", ".md", ".csv"}

# Configure embeddings (Google Gemini hosted API — no local model / GPU / torch,
# so the server fits in a free 512MB host instead of needing ~1GB for HuggingFace).
Settings.embed_model = GeminiEmbedding(
    model_name=embedding_model,
    api_key=google_api_key,
)

# Configure LLM (Groq hosted API — no GPU needed for inference)
Settings.llm = Groq(model=groq_model, api_key=groq_api_key)

# Count tokens on every LLM/embedding call. Read the running totals after a query
# and diff against the previous snapshot to get per-query usage.
token_counter = TokenCountingHandler()
Settings.callback_manager = CallbackManager([token_counter])

# The index holds ONLY the most recently uploaded ("active") document, so answers
# come strictly from that file. Uploading a new document replaces the index.
# ponytail: single active doc, not per-user or multi-doc history. Upgrade path if
# needed: one index per user/doc keyed in a dict instead of a single global.
index = None
active_filename = None


def get_query_engine(top_k: int = 5, model: str | None = None):
    """Query engine over the active document, or None if none uploaded.

    top_k: how many chunks to retrieve. model: optional Groq model override
    (must be in ALLOWED_MODELS, else ignored and the default LLM is used).
    """
    if index is None:
        return None
    llm = Groq(model=model, api_key=groq_api_key) if model in ALLOWED_MODELS else None
    return index.as_query_engine(similarity_top_k=top_k, llm=llm)


def ingest_file(file_path: str, chunk_size: int = 500, chunk_overlap: int = 50) -> int:
    """Replace the index with just the uploaded file and make it the active doc.

    Splits with the given chunk_size/overlap. Returns the real number of chunks
    (nodes) indexed. In-memory only.
    """
    global index, active_filename
    docs = SimpleDirectoryReader(input_files=[file_path]).load_data()
    splitter = SentenceSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    nodes = splitter.get_nodes_from_documents(docs)
    index = VectorStoreIndex(nodes)
    active_filename = os.path.basename(file_path)
    return len(nodes)


def token_snapshot() -> dict:
    """Current cumulative token counts (prompt/completion/embedding)."""
    return {
        "prompt": token_counter.prompt_llm_token_count,
        "completion": token_counter.completion_llm_token_count,
        "embedding": token_counter.total_embedding_token_count,
    }
