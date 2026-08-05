import os
from dotenv import load_dotenv
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import torch

# Path to .env
env_path = Path('.') / 'config' / '.env'
load_dotenv(dotenv_path=env_path)

# Load variables from .env
embedding_model = os.getenv("EMBEDDING_MODEL")
groq_model = os.getenv("GROQ_MODEL")
groq_api_key = os.getenv("GROQ_API_KEY")
documents_dir = os.getenv("DOCUMENTS_DIR")

# Detect whether a GPU is available (used by the local embedding model)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Configure embeddings (local HuggingFace model — Groq has no embeddings endpoint)
Settings.embed_model = HuggingFaceEmbedding(
    model_name=embedding_model,
    device=device
)

# Configure LLM (Groq hosted API — no GPU needed for inference)
Settings.llm = Groq(model=groq_model, api_key=groq_api_key)

# Build the index from the documents directory at startup
documents = SimpleDirectoryReader(documents_dir).load_data()
index = VectorStoreIndex.from_documents(documents)


def get_query_engine():
    """Return a query engine over the current index.

    Built per call so documents added at runtime via ingest_file() are visible.
    """
    return index.as_query_engine()


def ingest_file(file_path: str) -> int:
    """Load a single uploaded file and insert its documents into the live index.

    Returns the number of document chunks inserted. The file already lives under
    DOCUMENTS_DIR, so it is also re-read on the next startup (the index itself is
    in-memory and not persisted).
    """
    docs = SimpleDirectoryReader(input_files=[file_path]).load_data()
    for doc in docs:
        index.insert(doc)
    return len(docs)
