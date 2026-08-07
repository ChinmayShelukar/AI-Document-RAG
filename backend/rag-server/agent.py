import os
from dotenv import load_dotenv
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
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

# Configure embeddings (Google Gemini hosted API — no local model / GPU / torch,
# so the server fits in a free 512MB host instead of needing ~1GB for HuggingFace).
Settings.embed_model = GeminiEmbedding(
    model_name=embedding_model,
    api_key=google_api_key,
)

# Configure LLM (Groq hosted API — no GPU needed for inference)
Settings.llm = Groq(model=groq_model, api_key=groq_api_key)

# The index holds ONLY the most recently uploaded ("active") document, so answers
# come strictly from that file. Uploading a new document replaces the index.
# ponytail: single active doc, not per-user or multi-doc history. Upgrade path if
# needed: one index per user/doc keyed in a dict instead of a single global.
index = None
active_filename = None


def get_query_engine():
    """Return a query engine over the active document, or None if none uploaded."""
    if index is None:
        return None
    return index.as_query_engine(similarity_top_k=5)


def ingest_file(file_path: str) -> int:
    """Replace the index with just the uploaded file and make it the active doc.

    Returns the number of document chunks indexed. The index is in-memory only.
    """
    global index, active_filename
    docs = SimpleDirectoryReader(input_files=[file_path]).load_data()
    index = VectorStoreIndex.from_documents(docs)
    active_filename = os.path.basename(file_path)
    return len(docs)
