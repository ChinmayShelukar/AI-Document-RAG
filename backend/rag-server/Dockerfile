# RAG server image (Render / any container host).
# No local ML: Groq runs the LLM, Gemini runs embeddings — both hosted APIs.
# So this stays tiny and fits a free 512MB instance.
FROM python:3.11-slim

WORKDIR /app

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

# Render (and similar) inject $PORT; default to 5000 locally.
ENV PORT=5000
EXPOSE 5000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
