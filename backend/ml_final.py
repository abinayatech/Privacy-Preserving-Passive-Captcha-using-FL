import sys
import os
import json
import joblib
import numpy as np
import pandas as pd

def predict(features):
    # Load your actual model
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..'))
    model_path = os.path.join(project_root, 'models', 'rf_model_balanced_fixed.pkl')
    
    if not os.path.exists(model_path):
        return {"error": "Model not found"}
    
    try:
        model = joblib.load(model_path)
        
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
        
        # Predict
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        label = "human" if prediction == 1 else "bot"
        
        return {
            "prediction": int(prediction),
            "label": label,
            "confidence": float(probabilities[prediction]),
            "probabilities": {
                "human": float(probabilities[1]),
                "bot": float(probabilities[0])
            }
        }
        
    except Exception as e:
        return {"error": str(e)}

def main():
    input_data = sys.stdin.read().strip()
    
    if not input_data:
        print(json.dumps({"error": "No input"}))
        return
    
    try:
        features = json.loads(input_data)
        result = predict(features)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()