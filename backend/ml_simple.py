import sys
import json

def main():
    # Read input
    data = sys.stdin.read().strip()
    
    if not data:
        print(json.dumps({"error": "No input"}))
        return
    
    try:
        features = json.loads(data)
        
        # Simple logic - in reality, use your ML model
        mouse_moves = features.get('mouseMoves', 0)
        
        if mouse_moves > 5:
            result = {
                "prediction": 1,
                "label": "human",
                "confidence": 0.95,
                "probabilities": {"human": 0.95, "bot": 0.05}
            }
        else:
            result = {
                "prediction": 0,
                "label": "bot",
                "confidence": 0.90,
                "probabilities": {"human": 0.10, "bot": 0.90}
            }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()