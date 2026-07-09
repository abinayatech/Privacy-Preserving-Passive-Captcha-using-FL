import json
import sys
import os

print("🔍 DEBUG: Starting Python API...", file=sys.stderr)

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    print("🔍 DEBUG: Trying to import ml_predict...", file=sys.stderr)
    from ml_predict import BotPredictor
    print("✅ DEBUG: Import successful", file=sys.stderr)
    
    print("🔍 DEBUG: Creating predictor...", file=sys.stderr)
    predictor = BotPredictor()
    print("✅ DEBUG: Predictor created", file=sys.stderr)
    
    if predictor.model is None:
        print("❌ DEBUG: Model is None!", file=sys.stderr)
        MODEL_LOADED = False
    else:
        print("✅ DEBUG: Model loaded successfully", file=sys.stderr)
        MODEL_LOADED = True
        
except Exception as e:
    print(f"❌ DEBUG: Import error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    MODEL_LOADED = False

print(f"🔍 DEBUG: MODEL_LOADED = {MODEL_LOADED}", file=sys.stderr)

# Test prediction if model loaded
if MODEL_LOADED:
    try:
        test_features = {"mouseMoves": 25, "totalDistance": 1500.0, "scrolls": 4, "focusSwitches": 1}
        result = predictor.predict(test_features)
        print("✅ DEBUG: Prediction test successful", file=sys.stderr)
        print(json.dumps(result))
    except Exception as e:
        print(f"❌ DEBUG: Prediction error: {e}", file=sys.stderr)
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
else:
    print(json.dumps({"error": "Model not loaded", "debug": "Check stderr for details"}))
