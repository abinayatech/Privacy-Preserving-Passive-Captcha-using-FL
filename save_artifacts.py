import joblib, json
from ml_train import best_rf, scaler, best_threshold, features  # import from your training script

# Save artifacts for backend
joblib.dump(best_rf, "models/rf_model_v1_latest.pkl")
joblib.dump(scaler, "models/scaler_v1_latest.pkl")
with open("models/threshold_v1_latest.json", "w") as f:
    json.dump({"threshold": float(best_threshold)}, f)
with open("models/features_v1_latest.json", "w") as f:
    json.dump({"features": features}, f)

print("✅ Artifacts saved successfully in /models")
