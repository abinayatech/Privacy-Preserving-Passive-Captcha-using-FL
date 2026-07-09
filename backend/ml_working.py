import sys
import os
import json

print("[DEBUG] Starting ML model test...", file=sys.stderr)

# Fix paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..'))
models_dir = os.path.join(project_root, 'models')

print(f"[DEBUG] Project root: {project_root}", file=sys.stderr)
print(f"[DEBUG] Models dir: {models_dir}", file=sys.stderr)

# Check if model files exist
model_path = os.path.join(models_dir, 'rf_model_balanced_fixed.pkl')
scaler_path = os.path.join(models_dir, 'scaler_balanced_fixed.pkl')
features_path = os.path.join(models_dir, 'feature_names.pkl')

print(f"[DEBUG] Model path: {model_path}", file=sys.stderr)
print(f"[DEBUG] Exists: {os.path.exists(model_path)}", file=sys.stderr)

if not os.path.exists(model_path):
    print(json.dumps({"error": f"Model not found at {model_path}"}))
    sys.exit(1)

try:
    import joblib
    import numpy as np
    import pandas as pd
    
    print("[DEBUG] Loading model...", file=sys.stderr)
    model = joblib.load(model_path)
    
    scaler = None
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        print("[DEBUG] Scaler loaded", file=sys.stderr)
    
    feature_names = None
    if os.path.exists(features_path):
        feature_names = joblib.load(features_path)
    else:
        feature_names = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
    
    print(f"[DEBUG] Model loaded: {type(model)}", file=sys.stderr)
    print(f"[DEBUG] Features: {feature_names}", file=sys.stderr)
    
    # Get input from stdin (Node.js will send JSON)
    input_data = sys.stdin.read().strip()
    
    if input_data:
        features = json.loads(input_data)
        print(f"[DEBUG] Received features: {features}", file=sys.stderr)
    else:
        # Default test
        features = {
            'mouseMoves': 25,
            'totalDistance': 1500.0,
            'avgKeyInterval': 200,
            'scrolls': 4,
            'focusSwitches': 1
        }
        print("[DEBUG] Using default test features", file=sys.stderr)
    
    # Feature engineering (same as training)
    mouseMoves = features.get('mouseMoves', 0)
    totalDistance = features.get('totalDistance', 0.0)
    scrolls = features.get('scrolls', 0)
    focusSwitches = features.get('focusSwitches', 0)
    
    interaction_density = (scrolls + focusSwitches) / (mouseMoves + 1e-5)
    speed_per_scroll = totalDistance / (scrolls + 1)
    switch_ratio = focusSwitches / (scrolls + 1)
    
    # Create feature vector
    X = [[interaction_density, speed_per_scroll, scrolls, switch_ratio, focusSwitches]]
    
    # Scale if scaler exists
    if scaler is not None:
        X_scaled = scaler.transform(X)
    else:
        X_scaled = X
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    label = "human" if prediction == 1 else "bot"
    confidence = probabilities[prediction]
    
    result = {
        "prediction": int(prediction),
        "label": label,
        "confidence": float(confidence),
        "probabilities": {
            "human": float(probabilities[1]),
            "bot": float(probabilities[0])
        },
        "mlBased": True,
        "features": features
    }
    
    print(json.dumps(result))
    print("[DEBUG] Prediction complete", file=sys.stderr)
    
except Exception as e:
    error_msg = {"error": str(e), "mlBased": False, "fallback": True}
    print(json.dumps(error_msg))
    print(f"[ERROR] {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)