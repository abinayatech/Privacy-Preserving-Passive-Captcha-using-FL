import requests
import json

print("🧪 Testing new server...")

# Start server first, then run this test
try:
    # Test 1: Health check
    r = requests.get('http://localhost:5000/health')
    print(f"✅ Health: {r.json()}")
    
    # Test 2: ML prediction
    test_data = {
        "features": [0.6, 0.8, 0.4, 0.9, 0.7],
        "sessionId": "test_123"
    }
    
    r = requests.post('http://localhost:5000/predict', json=test_data)
    result = r.json()
    print(f"✅ Prediction: {result}")
    
    # Test 3: Check test-ml.html
    r = requests.get('http://localhost:5000/test-ml.html')
    if r.status_code == 200:
        print("✅ test-ml.html is accessible")
        if 'security-check.js' in r.text:
            print("✅ Contains ML JavaScript")
    else:
        print(f"❌ test-ml.html: {r.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n⚠️ Make sure server is running:")
    print("   python server.py")
