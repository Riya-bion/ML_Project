from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import pandas as pd
import joblib
from pathlib import Path
import os

app = FastAPI(
    title="Cardio Risk Prediction AI API",
    description="Machine learning API for cardiovascular disease risk assessment",
    version="1.0.0"
)

# Enable CORS for frontend clients (Vercel, Netlify, localhost, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve model path relative to file location
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "cardio_pipeline.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model pipeline not found at {MODEL_PATH}")

pipeline = joblib.load(MODEL_PATH)


class CardioData(BaseModel):
    age: float = Field(..., description="Age in years (e.g. 50) or days (e.g. 18250)")
    gender: int = Field(..., description="Gender (1: Female, 2: Male or 0/1)")
    height: float = Field(..., description="Height in cm")
    weight: float = Field(..., description="Weight in kg")
    ap_hi: float = Field(..., description="Systolic blood pressure")
    ap_lo: float = Field(..., description="Diastolic blood pressure")
    cholesterol: int = Field(..., description="Cholesterol level (1: normal, 2: above normal, 3: well above normal)")
    gluc: int = Field(..., description="Glucose level (1: normal, 2: above normal, 3: well above normal)")
    smoke: int = Field(0, description="Smoking status (0: no, 1: yes)")
    alco: int = Field(0, description="Alcohol intake (0: no, 1: yes)")
    active: int = Field(1, description="Physical activity (0: no, 1: yes)")


@app.get("/api")
def api_info():
    return {
        "status": "online",
        "service": "Cardio Risk Prediction AI API",
        "endpoints": {
            "health": "/health",
            "predict": "POST /predict",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": pipeline is not None}


@app.post("/predict")
def predict(data: dict):
    try:
        df = pd.DataFrame([data])

        # Semantic preprocessing:
        # Check if age was passed in days (>120) or in years (<=120)
        if "age" in df.columns:
            age_val = float(df["age"].iloc[0])
            if age_val > 120:
                df["age_years"] = age_val / 365.25
            else:
                df["age_years"] = age_val
            df.drop(columns=["age"], inplace=True)

        prob = pipeline.predict_proba(df)[0][1]

        return {
            "probability": round(float(prob), 4),
            "risk": int(prob >= 0.5),
            "risk_percentage": round(float(prob) * 100, 1),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# Serve frontend static assets if built directory exists, otherwise serve root API info
STATIC_DIR = BASE_DIR.parent / "cardio-frontend" / "dist"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    @app.get("/")
    def root():
        return api_info()
