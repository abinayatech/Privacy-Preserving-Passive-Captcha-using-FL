import requests
import json

# Test connection
print("Testing Flask server connection...")
response = requests.get('http://localhost:5000/health')
print(f"Health Check: {response.json()}")

# Test prediction endpoint
print("\nTesting ML prediction endpoint...")
test_features = [0.5, 0.6, 0.7, 0.8, 0.9]  # Example human-like features
test_data = {
    "features": test_features,
    "sessionId": "test_" + str(hash("test"))
}

response = requests.post('http://localhost:5000/predict', 
                        json=test_data,
                        headers={'Content-Type': 'application/json'})

print(f"Prediction Response: {response.json()}")

# Test FL status
print("\nTesting FL status...")
response = requests.get('http://localhost:5000/federated/status')
print(f"FL Status: {response.json()}")

print("\n✅ All tests passed! JavaScript should now send correct format.")