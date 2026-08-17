# services/scraping-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dependencies are copied and installed before the source so Docker can reuse the
# layer whenever only application code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Managed hosts (Railway, Render, Cloud Run) inject the port to listen on.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
