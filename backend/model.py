import pickle
import numpy as np

with open("model.pkl", "rb") as f:
    artifact = pickle.load(f)

model = artifact["model"]
scaler = artifact["scaler"]
feature_order = artifact["feature_order"]

def predict_risk(input_dict):
    x = np.array([[input_dict[f] for f in feature_order]])
    x_scaled = scaler.transform(x)
    prob = model.predict_proba(x_scaled)[0][1]

    return {
        "probability": round(float(prob), 4),
        "risk": int(prob >= 0.5)
    }
