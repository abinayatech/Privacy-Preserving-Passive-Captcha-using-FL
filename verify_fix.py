import requests
import json
import sys

def test_predict_endpoint():
    """Test if the endpoint accepts correct format"""
    print("?? Testing /predict endpoint format...")
    
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
        
        print(f"? Test 1 - Correct format:")
        print(f"   Success: {result['success']}")
        print(f"   Is Human: {result.get('is_human', 'N/A')}")
        
        if not result['success']:
            print(f"   Error: {result.get('error', 'Unknown')}")
            
    except Exception as e:
        print(f"? Test 1 failed: {e}")
    
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
        
        print(f"\n? Test 2 - Wrong format (should fail):")
        print(f"   Success: {result['success']}")
        print(f"   Error: {result.get('error', 'No error')}")
        
    except Exception as e:
        print(f"? Test 2 failed: {e}")

def check_flask_status():
    """Check if Flask is running"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=3)
        status = response.json()
        print(f"\n?? Flask Status:")
        print(f"   Server: {status.get('status', 'N/A')}")
        print(f"   Model: {status.get('model_status', 'N/A')}")
        print(f"   FL Round: {status.get('fl_round', 'N/A')}")
        return True
    except requests.exceptions.ConnectionError:
        print("\n? Flask server not running!")
        print("   Run: python flask_server.py")
        return False
    except Exception as e:
        print(f"\n?? Flask check error: {e}")
        return False

def test_javascript_integration():
    """Provide steps to test JavaScript"""
    print("\n?? JavaScript Integration Test:")
    print("1. Open http://localhost:5000/test-ml.html")
    print("2. Press F12 to open DevTools")
    print("3. Go to Console tab")
    print("4. You should see: '?? ML CAPTCHA System Initializing...'")
    print("5. Move mouse around the page")
    print("6. Type in the input fields")
    print("7. Click 'Submit Test' button")
    print("8. Check for popup in top-right corner")
    print("\n?? Expected Console Output:")
    print("   ?? Extracted 5 features: [numbers...]")
    print("   ?? SENDING to /predict: {features: Array(5), ...}")
    print("   ?? RECEIVED from ML: {success: true, ...}")

if __name__ == "__main__":
    print("?? Verifying ML CAPTCHA Fix...")
    print("=" * 50)
    
    if check_flask_status():
        test_predict_endpoint()
        test_javascript_integration()
        
    print("\n" + "=" * 50)
    print("?? If tests pass but browser shows issues:")
    print("   � Clear browser cache: Ctrl+Shift+Delete ? All time")
    print("   � Hard refresh: Ctrl+Shift+R")
    print("   � Check Network tab in DevTools")
