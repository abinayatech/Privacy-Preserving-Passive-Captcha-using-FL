import json
import sys
import os

# Silence all print statements from ml_predict
class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr

# Import your predictor WITH hidden prints
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

with HiddenPrints():
    try:
        from ml_predict import BotPredictor
        predictor = BotPredictor()
        MODEL_LOADED = predictor.model is not None
    except:
        MODEL_LOADED = False

def predict_silent(features):
    """Predict without any debug output"""
    if not MODEL_LOADED:
        return {"error": "Model failed to load"}
    
    required = {
        'mouseMoves': features.get('mouseMoves', 0),
        'totalDistance': features.get('totalDistance', 0.0),
        'scrolls': features.get('scrolls', 0),
        'focusSwitches': features.get('focusSwitches', 0)
    }
    
    # Get prediction (all prints are hidden)
    with HiddenPrints():
        result = predictor.predict(required)
    
    # Return clean result
    return {
        "prediction": result.get("prediction", -1),
        "label": result.get("label", "unknown"),
        "confidence": result.get("confidence", 0.0),
        "probabilities": result.get("probabilities", {})
    }

if __name__ == "__main__":
    try:
        # Read input
        input_data = sys.stdin.read().strip()
        
        if input_data:
            features = json.loads(input_data)
        else:
            features = {"mouseMoves": 25, "totalDistance": 1500.0, "scrolls": 4, "focusSwitches": 1}
        
        result = predict_silent(features)
        # OUTPUT ONLY JSON, NOTHING ELSE
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "label": "error"}))
