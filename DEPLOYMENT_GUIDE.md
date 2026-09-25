# 🚀 Deployment Guide — Cardio Risk Prediction AI

This project consists of:
- **Backend API**: Python FastAPI + XGBoost/Scikit-Learn ML pipeline (`backend/`)
- **Frontend App**: React 19 + Vite + Tailwind CSS (`cardio-frontend/`)

---

## 🎯 Option 1: Render (1-Click Blueprint — Recommended & 100% Free)

Both your Backend and Frontend can be deployed automatically together using the included [`render.yaml`](./render.yaml).

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
2. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in.
3. Click **"New +"** → Select **"Blueprint"**.
4. Connect your GitHub repository.
5. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **`cardio-risk-api`** (FastAPI Web Service)
   - **`cardio-risk-frontend`** (Static React App with `VITE_API_URL` linked automatically)
6. Click **"Apply"** to deploy!

---

## ⚡ Option 2: Render (Backend) + Vercel (Frontend)

This is the standard modern stack (FastAPI on Render + React on Vercel).

### Step 1: Deploy Backend to Render
1. Push project to GitHub.
2. In Render dashboard, click **"New +"** → **"Web Service"**.
3. Select your repository.
4. Configure settings:
   - **Name**: `cardio-risk-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Click **"Create Web Service"**.
6. Copy your live backend URL (e.g. `https://cardio-risk-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Go to **[vercel.com](https://vercel.com/)** and log in.
2. Click **"Add New..."** → **"Project"** → Import your repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `cardio-frontend`
   - **Environment Variables**:
     - Key: `VITE_API_URL`
     - Value: `https://cardio-risk-backend.onrender.com` (your Render URL)
4. Click **"Deploy"**.

---

## 🐳 Option 3: Docker / Railway / Hugging Face Spaces / Fly.io

### Deploying with Docker Compose (Local or VPS):
```bash
docker-compose up --build
```
- Frontend will run on: `http://localhost:3000`
- Backend API will run on: `http://localhost:8000`

### Deploying Single Fullstack Container:
The root [`Dockerfile`](./Dockerfile) builds the React frontend and packages it directly inside FastAPI.
```bash
docker build -t cardio-app .
docker run -p 8000:8000 -e PORT=8000 cardio-app
```
Access the full web application at `http://localhost:8000`.

---

## 🛠️ Configuration Reference

| Environment Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Frontend pointer to Backend API | `https://cardio-risk-api.onrender.com` |
| `PORT` | Backend binding port | `8000` (auto-set by cloud platforms) |

---

## 🩺 Health Check & API Endpoints
- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (Interactive Swagger UI)
- **Prediction**: `POST /predict`
