import requests
import json

# Test the format Flask expects
test_data = {
    "features": [0.6, 0.8, 0.4, 0.9, 0.7],
    "sessionId": "direct_test"
}

try:
    response = requests.post('http://localhost:5000/predict', json=test_data)
    result = response.json()
    print(" Direct API test successful!")
    print(f"   Success: {result['success']}")
    print(f"   Is Human: {result.get('is_human', 'N/A')}")
    print(f"   Confidence: {result.get('confidence', 'N/A')}")
except Exception as e:
    print(f" API test failed: {e}")
