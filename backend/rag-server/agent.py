import os
from dotenv import load_dotenv
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import torch

# Caminnho da .env
env_path = Path('.') / 'config' / '.env'
load_dotenv(dotenv_path=env_path)


# Carrega variáveis do .env
embedding_model = os.getenv("EMBEDDING_MODEL")
ollama_model = os.getenv("OLLAMA_MODEL")
ollama_url = os.getenv("OLLAMA_BASE_URL")
ollama_timeout = float(os.getenv("OLLAMA_TIMEOUT"))
ollama_context_window = int(os.getenv("OLLAMA_CONTEXT_WINDOW"))
ollama_temperature = float(os.getenv("OLLAMA_TEMPERATURE"))
documents_dir = os.getenv("DOCUMENTS_DIR")

# Detecta se a GPU está disponível
device = "cuda" if torch.cuda.is_available() else "cpu"

# Configura embedding
Settings.embed_model = HuggingFaceEmbedding(
    model_name=embedding_model,
    device=device
)

# Configura LLM
Settings.llm = Ollama(
    model=ollama_model,
    base_url=ollama_url,
    request_timeout=ollama_timeout,
    context_window=ollama_context_window,
    temparature=ollama_temperature
)

# Carrega documentos
documents = SimpleDirectoryReader(documents_dir).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
