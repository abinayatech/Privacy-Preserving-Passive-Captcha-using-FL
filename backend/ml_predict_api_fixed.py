import json
import sys
import os

# Fix path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from ml_predict import BotPredictor
    HAS_MODEL = True
except ImportError as e:
    HAS_MODEL = False
    print(json.dumps({"error": f"Import error: {str(e)}"}))
    sys.exit(1)

def predict_bot_simple(features):
    """Simple prediction wrapper - human=1, bot=0"""
    if not HAS_MODEL:
        return {"error": "Model not available"}
    
    predictor = BotPredictor()
    if predictor.model is None:
        return {"error": "Model failed to load"}
    
    # Prepare features
    required = {
        'mouseMoves': features.get('mouseMoves', 0),
        'totalDistance': features.get('totalDistance', 0.0),
        'scrolls': features.get('scrolls', 0),
        'focusSwitches': features.get('focusSwitches', 0)
    }
    
    # Get prediction
    result = predictor.predict(required)
    
    # Fix probability labels if needed
    if 'probabilities' in result:
        # Ensure human probability is first
        probs = result['probabilities']
        if 'human' in probs and 'bot' in probs:
            # Keep as is - model returns correctly
            pass
    
    return result

if __name__ == "__main__":
    try:
        # Read input
        input_data = sys.stdin.read().strip()
        
        if input_data:
            features = json.loads(input_data)
        else:
            # Default test
            features = {
                'mouseMoves': 25,
                'totalDistance': 1500.0,
                'scrolls': 4,
                'focusSwitches': 1
            }
        
        result = predict_bot_simple(features)
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
