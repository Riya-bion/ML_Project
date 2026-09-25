# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/cardio-frontend

COPY cardio-frontend/package*.json ./
RUN npm ci

COPY cardio-frontend/ ./
RUN npm run build

# Stage 2: Backend & Final Serving Image
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/cardio-frontend/dist ./cardio-frontend/dist

EXPOSE 8000
ENV PORT=8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
