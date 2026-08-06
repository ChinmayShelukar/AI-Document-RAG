# RAG server image for Hugging Face Spaces (Docker SDK).
# CPU-only — Groq runs the LLM in the cloud; local HF model only does embeddings.
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install CPU-only PyTorch first (smaller than the default CUDA build)
RUN pip install --upgrade pip && \
    pip install torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# HF Spaces caches models under /app; make it writable and point HF cache there
ENV HF_HOME=/app/.cache
RUN mkdir -p /app/.cache /app/data && chmod -R 777 /app/.cache /app/data

# Hugging Face Spaces expects the app on port 7860
EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
