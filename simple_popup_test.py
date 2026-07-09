# simple_popup_test.py - COMPLETE FIXED VERSION
from playwright.sync_api import sync_playwright
import time
import requests

print("🔍 COMPLETE TEST: POPUP DISPLAY + ATTACK DETECTION")
print("=" * 60)

# ==================== PART 1: DIRECT ATTACK API TEST ====================
print("\n📡 PART 1: Direct API Attack Test")
print("-" * 40)

attack_data = {
    "features": [0.01, 0.0, 0.02, 0.0, 0.0],
    "sessionId": f"playwright_attack_session_{int(time.time())}"
}

print(f"Sending attack with session: {attack_data['sessionId']}")

try:
    response = requests.post('http://localhost:5000/predict', json=attack_data, timeout=5)
    result = response.json()
    
    if result.get('success'):
        print(f"✅ Attack sent successfully!")
        print(f"   Prediction: {result['prediction'].upper()}")
        print(f"   Is Attack: {result.get('is_attack', 0)}")
        print(f"   Confidence: {result.get('confidence', 0)*100:.1f}%")
    else:
        print(f"❌ Attack failed: {result}")
except Exception as e:
    print(f"❌ Error: {e}")

# Wait a moment before browser test
time.sleep(2)

# ==================== PART 2: Browser Popup Test ====================
print("\n\n🌐 PART 2: Browser Popup Test")
print("-" * 40)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=500)
    page = browser.new_page()
    
    # Go to verify page
    page.goto("http://localhost:5000/verify.html")
    time.sleep(2)
    
    print("✅ Page loaded")
    
    # Remove any existing popup first
    page.evaluate("""
        const existingPopup = document.getElementById('ml-captcha-popup');
        if (existingPopup) {
            existingPopup.remove();
            console.log('Removed existing popup');
        }
    """)
    
    # Inject attack session ID before submission
    page.evaluate("""
        // Set attack session ID
        window.attackSessionId = 'playwright_browser_attack_' + Date.now();
        console.log('Attack session:', window.attackSessionId);
        
        // Override security check session if exists
        if (window.securityCheck) {
            window.securityCheck.sessionId = window.attackSessionId;
            console.log('SecurityCheck session overridden');
        }
    """)
    
    # Fill and submit form
    page.fill('input[name="aadhaar_number"]', '123456789012')
    page.click('button[type="submit"]')
    
    print("⏳ Form submitted - waiting for popup...")
    
    # Wait for popup (max 10 seconds)
    popup_found = False
    popup_text = ""
    
    for i in range(10):
        time.sleep(1)
        
        popup_info = page.evaluate("""
            () => {
                const popup = document.getElementById('ml-captcha-popup');
                if (!popup) return {found: false};
                const style = window.getComputedStyle(popup);
                return {
                    found: true,
                    visible: style.display !== 'none',
                    text: popup.innerText
                };
            }
        """)
        
        if popup_info.get('found') and popup_info.get('visible'):
            print(f"✅ POPUP FOUND after {i+1}s")
            popup_text = popup_info.get('text', '')
            print(f"   Message: {popup_text}")
            popup_found = True
            break
        else:
            print(f"   Waiting... {i+1}/10")
    
    if not popup_found:
        print("⚠️ Popup not found within 10 seconds")
    
    # Take screenshot
    page.screenshot(path="test_complete.png")
    print("📸 Screenshot saved: test_complete.png")
    
    time.sleep(3)
    browser.close()

# ==================== PART 3: Verify Results ====================
print("\n\n📊 PART 3: Verification")
print("-" * 40)

# Wait a moment for database to update
time.sleep(1)

try:
    dashboard = requests.get('http://localhost:5000/api/dashboard-stats', timeout=5)
    stats = dashboard.json()
    
    print(f"✅ Model Accuracy: {stats.get('global_accuracy', 'N/A')}%")
    print(f"✅ Total Predictions: {stats.get('total_predictions', 'N/A')}")
    print(f"✅ Attacks Detected: {stats.get('attack_detections', 'N/A')}")
    
    if stats.get('attack_detections', 0) > 0:
        print("\n🎉 SUCCESS! Attack counter increased!")
    else:
        print("\n⚠️ Attack counter still 0 - check Flask server")
        
except Exception as e:
    print(f"❌ Could not fetch dashboard stats: {e}")

print("\n" + "=" * 60)
print("✅ TEST COMPLETE")
print("=" * 60)
print("\n🔍 CHECK FLASK TERMINAL FOR:")
print("   '🤖 PLAYWRIGHT ATTACK DETECTED!'")
print("\n📊 Dashboard: http://localhost:5000/dashboard")