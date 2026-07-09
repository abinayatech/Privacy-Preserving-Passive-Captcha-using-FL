import requests
import json

def test_predict_endpoint():
    """Test if the endpoint accepts correct format"""
    print("🧪 Testing /predict endpoint format...")
    
    # Test 1: Correct format (5 features)
    test_data = {
        "features": [0.5, 0.6, 0.7, 0.8, 0.9],
        "sessionId": "test_123"
    }
    
    try:
        response = requests.post('http://localhost:5000/predict', 
                                json=test_data,
                                timeout=5)
        result = response.json()
        
        print(f"✅ Test 1 - Correct format:")
        print(f"   Success: {result['success']}")
        print(f"   Is Human: {result.get('is_human', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Test 1 failed: {e}")
    
    # Test 2: Wrong format (what JavaScript was sending before)
    wrong_data = {
        "mouse_movements": 10,
        "typing_pattern": "none",
        "sessionId": "test_456"
    }
    
    try:
        response = requests.post('http://localhost:5000/predict', 
                                json=wrong_data,
                                timeout=5)
        result = response.json()
        
        print(f"\n✅ Test 2 - Wrong format (should fail):")
        print(f"   Success: {result['success']}")
        print(f"   Error: {result.get('error', 'No error')}")
        
    except Exception as e:
        print(f"❌ Test 2 failed: {e}")

def check_flask_status():
    """Check if Flask is running"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=3)
        print(f"\n🌐 Flask Status: {response.json()}")
        return True
    except:
        print("\n❌ Flask server not running!")
        print("   Run: python flask_server.py")
        return False

if __name__ == "__main__":
    print("🔍 Verifying ML CAPTCHA Fix...")
    
    if check_flask_status():
        test_predict_endpoint()
        
        print("\n📋 Next Steps:")
        print("1. Open http://localhost:5000/test-ml.html")
        print("2. Open DevTools (F12)")
        print("3. Move mouse and type in fields")
        print("4. Click 'Submit Test'")
        print("5. Check Console for logs")
        print("6. Look for popup in top-right corner")