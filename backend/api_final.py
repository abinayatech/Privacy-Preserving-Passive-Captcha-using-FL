import json
import sys
import os

# CLEAN API - NO PRINT STATEMENTS!
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import joblib
    import numpy as np
    
    # Load everything SILENTLY
    model = joblib.load('models/rf_model_balanced_fixed.pkl')
    
    # Try to load scaler
    if os.path.exists('models/scaler_balanced_fixed.pkl'):
        scaler = joblib.load('models/scaler_balanced_fixed.pkl')
    else:
        scaler = None
    
    # Try to load feature names
    if os.path.exists('models/feature_names.pkl'):
        feature_names = joblib.load('models/feature_names.pkl')
    else:
        feature_names = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
    
    MODEL_LOADED = True
    
except Exception:
    model = None
    scaler = None
    feature_names = None
    MODEL_LOADED = False

def predict_clean(features):
    """Predict WITHOUT any print statements"""
    if not MODEL_LOADED:
        return {"error": "Model not loaded", "label": "error"}
    
    try:
        # Get features
        mouseMoves = features.get('mouseMoves', 0)
        totalDistance = features.get('totalDistance', 0.0)
        scrolls = features.get('scrolls', 0)
        focusSwitches = features.get('focusSwitches', 0)
        
        # Avoid division by zero
        if mouseMoves == 0:
            mouseMoves = 0.0001
        
        # Engineer features (SAME as training)
        engineered = {
            'interaction_density': (scrolls + focusSwitches) / mouseMoves,
            'speed_per_scroll': totalDistance / (scrolls + 1),
            'scrolls': scrolls,
            'switch_ratio': focusSwitches / (scrolls + 1),
            'focusSwitches': focusSwitches
        }
        
        # Create feature vector
        feature_vector = [engineered[fn] for fn in feature_names]
        
        # Scale if scaler exists
        if scaler is not None:
            feature_vector = scaler.transform([feature_vector])[0]
        
        # Make prediction
        prediction = model.predict([feature_vector])[0]
        probabilities = model.predict_proba([feature_vector])[0]
        confidence = probabilities[prediction]
        
        # Map: human=1, bot=0
        label = 'human' if prediction == 1 else 'bot'
        
        return {
            'prediction': int(prediction),
            'label': label,
            'confidence': float(confidence),
            'probabilities': {
                'human': float(probabilities[1]),
                'bot': float(probabilities[0])
            }
        }
        
    except Exception as e:
        return {"error": str(e), "label": "error"}

# MAIN: Read from stdin, output ONLY JSON
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        
        if input_data:
            features = json.loads(input_data)
        else:
            features = {"mouseMoves": 25, "totalDistance": 1500.0, "scrolls": 4, "focusSwitches": 1}
        
        result = predict_clean(features)
        print(json.dumps(result))  # ONLY THIS LINE OUTPUTS
        
    except Exception as e:
        print(json.dumps({"error": str(e), "label": "error"}))
