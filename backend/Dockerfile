# Multi-stage build for a lightweight image
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim as runner

WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY app/ ./app/
COPY main.py .

ENV PATH=/root/.local/bin:$PATH
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["python", "main.py"]
