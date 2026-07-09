# test_federated_system.py
import requests
import json

print("🧪 Testing Federated CAPTCHA System")

# Test 1: Health check
print("\n1. Health check...")
try:
    health = requests.get('http://localhost:5000/health')
    print(f"   Status: {health.status_code}")
    print(f"   Response: {health.json()}")
except Exception as e:
    print(f"   ❌ Failed: {e}")

# Test 2: Model prediction
print("\n2. Testing ML prediction...")
test_data = {
    'features': [12.5, 1.0, 0.5, 2.3, 1.1],
    'sessionId': 'test_federated_1'
}

try:
    response = requests.post('http://localhost:5000/predict', 
                           json=test_data,
                           headers={'Content-Type': 'application/json'})
    
    if response.status_code == 200:
        result = response.json()
        print(f"   ✅ Success: {result.get('prediction')}")
        print(f"   Confidence: {result.get('confidence'):.1%}")
        print(f"   Model: {result.get('model_type')}")
    else:
        print(f"   ❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
        
except Exception as e:
    print(f"   ❌ Exception: {e}")

# Test 3: Federated status
print("\n3. Federated Learning status...")
try:
    status = requests.get('http://localhost:5000/federated/status')
    if status.status_code == 200:
        fl_status = status.json()
        print(f"   ✅ FL Active: Round {fl_status.get('current_round')}")
        print(f"   Model: {fl_status.get('model_type')}")
    else:
        print(f"   ❌ Failed: {status.status_code}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

print("\n✅ Test completed!")