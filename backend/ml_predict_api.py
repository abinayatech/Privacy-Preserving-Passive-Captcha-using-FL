import json
import sys
import os

# Fix path issues
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from ml_predict import BotPredictor
except ImportError as e:
    print(json.dumps({"error": f"Import error: {str(e)}"}))
    sys.exit(1)

# Create predictor
predictor = BotPredictor()

def predict_bot(features):
    """Make prediction from features - human=1, bot=0"""
    if predictor.model is None:
        return {"error": "Model not loaded", "label": "unknown"}
    
    # Only use features the model needs
    required_features = {
        'mouseMoves': features.get('mouseMoves', 0),
        'totalDistance': features.get('totalDistance', 0.0),
        'scrolls': features.get('scrolls', 0),
        'focusSwitches': features.get('focusSwitches', 0)
    }
    
    result = predictor.predict(required_features)
    
    # Ensure correct label mapping for API
    if 'label' in result:
        # Double-check mapping
        if result.get('prediction') == 1 and result.get('label') == 'bot':
            # Fix if reversed
            result['label'] = 'human'
        elif result.get('prediction') == 0 and result.get('label') == 'human':
            result['label'] = 'bot'
    
    return result

# Command-line interface for Playwright
if __name__ == "__main__":
    try:
        # Read JSON from stdin (Playwright will send data)
        input_data = sys.stdin.read()
        
        if input_data:
            features = json.loads(input_data)
            result = predict_bot(features)
            print(json.dumps(result))
        else:
            # Test if no input - WITH CORRECT EXPECTATIONS
            print("Testing with human-like behavior (should be human=1):")
            test_features = {
                'mouseMoves': 25,
                'totalDistance': 1500.0,
                'scrolls': 4,
                'focusSwitches': 1
            }
            result = predict_bot(test_features)
            print(json.dumps(result))
            
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
