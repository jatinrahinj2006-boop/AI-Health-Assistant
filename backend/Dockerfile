# Stage 1: Build the React frontend SPA
FROM node:20-alpine as frontend-builder

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Compile backend dependencies
FROM python:3.11-slim as backend-builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 3: Run the combined application container
FROM python:3.11-slim as runner

WORKDIR /app

# Copy python dependencies
COPY --from=backend-builder /root/.local /root/.local

# Copy React static assets to /app/static for serving
COPY --from=frontend-builder /frontend/dist ./static/

# Copy FastAPI backend code
COPY backend/app/ ./app/
COPY backend/main.py .

# Environment setup
ENV PATH=/root/.local/bin:$PATH
ENV HOST=0.0.0.0
ENV PORT=8000
ENV ENV=production

EXPOSE 8000

CMD ["python", "main.py"]
