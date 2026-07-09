# test_simple.py - CORRECTED with proper features array
import requests
import json
import numpy as np

print("🔧 Testing ML CAPTCHA System")
print("=" * 50)

# Test 1: Check if Flask server is running
try:
    response = requests.get('http://localhost:5000/health', timeout=5)
    data = response.json()
    print(f"✅ Flask server: {response.status_code}")
    print(f"   Model type: {data.get('model')}")
    print(f"   Input shape: {data.get('ml_libraries', {}).get('input_shape', 'Not found')}")
except Exception as e:
    print(f"❌ Flask server error: {e}")
    exit()

# Test 2: Get model info to understand expected features
try:
    response = requests.get('http://localhost:5000/api/model', timeout=5)
    if response.status_code == 200:
        model_info = response.json()
        print(f"\n📐 Model Info:")
        print(f"   Type: {model_info.get('type')}")
        print(f"   Input Shape: {model_info.get('input_shape')}")
        print(f"   Layers: {model_info.get('layers')}")
except:
    print("\n⚠️ Could not get model info (endpoint might not exist)")

# Test 3: Test prediction endpoint with CORRECT format
# Based on your flask_server.py, the model expects an array of 5 numbers
# Typical order might be: [mouse_score, typing_score, time_score, scroll_score, input_score]
test_data = {
    "features": [0.1, 0.2, 0.1, 0.2, 0.1],  # BOT-LIKE features (low values)
    "sessionId": "test_bot_001"
}

print(f"\n📊 Testing with bot-like behavior:")
print(f"   Features array: {test_data['features']}")
print(f"   Expected: 5 numerical values (currently: {len(test_data['features'])})")

try:
    response = requests.post('http://localhost:5000/predict', 
                           json=test_data, timeout=5)
    
    print(f"\n📦 Response status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Full response: {json.dumps(result, indent=2)}")
        
        if result.get('success') == False:
            print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
        else:
            if result.get('prediction') == 'BOT':
                print("\n🎯 SUCCESS: Bot correctly detected!")
                print(f"   Confidence: {result.get('confidence', 'N/A')}")
                print(f"   Threshold: {result.get('threshold', 'N/A')}")
                print(f"   Model: {result.get('model_type', 'N/A')}")
            else:
                print(f"\n⚠️ Result: {result.get('prediction')}")
                print(f"   (Bot might not cross threshold yet)")
                
    else:
        print(f"❌ Prediction failed with status: {response.status_code}")
        print(f"   Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error during prediction: {e}")

print("\n" + "=" * 50)
print("📋 NEXT STEPS if this works:")
print("1. Update JavaScript to send 'features' array instead of object")
print("2. Convert behavior metrics to 5 numerical values 0-1")
print("3. Test with Playwright script")
print("\n💡 Run this test again after updating JavaScript!")
