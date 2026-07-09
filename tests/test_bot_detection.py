# Update your tests/test_bot_detection.py with this code:
from playwright.sync_api import Page, expect
import re
import time

def test_bot_detection_ml_captcha(page: Page):
    """Test that our ML CAPTCHA system detects Playwright automation as a bot."""
    
    print("🤖 Starting ML CAPTCHA Bot Detection Test...")
    print("=" * 50)
    
    # 1. Go to your running Flask app
    print("🌐 Navigating to http://localhost:5000/verify.html")
    page.goto("http://localhost:5000/verify.html")
    
    # Wait for page to load
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    print(f"✅ Page loaded: {page.title()}")
    print(f"📄 Current URL: {page.url}")
    
    # Take initial screenshot
    page.screenshot(path="tests/initial_page.png")
    print("📸 Initial screenshot saved: tests/initial_page.png")
    
    # 2. Check page elements
    print("\n🔍 Page elements:")
    
    # Check for input fields
    inputs = page.locator('input').all()
    print(f"Found {len(inputs)} input fields:")
    for i, inp in enumerate(inputs):
        inp_id = inp.get_attribute('id') or 'no-id'
        inp_name = inp.get_attribute('name') or 'no-name'
        inp_type = inp.get_attribute('type') or 'no-type'
        print(f"  Input {i}: id='{inp_id}', name='{inp_name}', type='{inp_type}'")
    
    # Check for buttons
    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons:")
    for i, btn in enumerate(buttons):
        btn_text = btn.inner_text() or 'no-text'
        btn_type = btn.get_attribute('type') or 'no-type'
        print(f"  Button {i}: text='{btn_text}', type='{btn_type}'")
    
    # 3. Check ML JavaScript
    print("\n🔍 Checking ML JavaScript...")
    
    console_messages = []
    def handle_console(msg):
        console_messages.append({
            'type': msg.type,
            'text': msg.text,
            'time': time.time()
        })
        if 'ML' in msg.text.upper() or 'CAPTCHA' in msg.text.upper():
            print(f"   Console: {msg.text}")
    
    page.on("console", handle_console)
    
    # Check ML functions
    ml_functions = page.evaluate('''
        () => {
            const functions = [];
            if (typeof sendToMLModel === 'function') functions.push('sendToMLModel');
            if (typeof extractFeatures === 'function') functions.push('extractFeatures');
            console.log('ML Functions: ' + functions.join(', '));
            return functions;
        }
    ''')
    
    print(f"✅ ML Functions found: {ml_functions}")
    
    # 4. Simulate BOT behavior
    print("\n🤖 Simulating BOT behavior...")
    print("   - INSTANT form fill")
    print("   - IMMEDIATE submit")
    
    # Find and fill Aadhaar field
    aadhaar_input = page.locator('input[name="aadhaar_number"]')
    if aadhaar_input.count() > 0:
        print("✅ Found Aadhaar input field")
        aadhaar_input.fill('1234 5678 9012', force=True)
        print("✅ Field filled instantly (bot-like)")
    else:
        print("❌ Could not find aadhaar_number input")
        # Try any input
        first_input = page.locator('input').first
        if first_input.count() > 0:
            first_input.fill('123456789012', force=True)
    
    # Submit instantly
    print("\n🚀 Submitting instantly...")
    submit_button = page.locator('button[type="submit"]')
    if submit_button.count() > 0:
        submit_button.click(force=True)
        print("✅ Form submitted instantly (bot-like)")
    else:
        # Try any button
        any_button = page.locator('button').first
        if any_button.count() > 0:
            any_button.click(force=True)
    
    # 5. Wait for ML CAPTCHA popup
    print("\n⏳ Waiting for ML CAPTCHA response...")
    print("Looking for: #ml-captcha-popup")
    
    start_time = time.time()
    timeout = 10
    popup_found = False
    
    while time.time() - start_time < timeout:
        # Check for ML popup
        popup = page.locator('#ml-captcha-popup')
        
        if popup.count() > 0:
            if popup.is_visible():
                popup_text = popup.inner_text()
                print(f"\n✅ ML CAPTCHA POPUP FOUND after {time.time() - start_time:.1f}s")
                print(f"📢 Message: {popup_text}")
                
                if "BOT" in popup_text.upper():
                    print("🎉 SUCCESS: ML system detected BOT!")
                    
                    # Check popup color
                    popup_color = popup.evaluate("""
                        (element) => {
                            return window.getComputedStyle(element).backgroundColor;
                        }
                    """)
                    print(f"🎨 Popup color: {popup_color}")
                    
                    # Take success screenshot
                    page.screenshot(path="tests/bot_detected_success.png")
                    print("📸 Screenshot saved: tests/bot_detected_success.png")
                    
                elif "HUMAN" in popup_text.upper():
                    print(f"❌ FAILURE: ML detected BOT as HUMAN: {popup_text}")
                    print("   Increase threshold in flask_server.py")
                    
                    page.screenshot(path="tests/false_human.png")
                    print("📸 Screenshot saved: tests/false_human.png")
                
                popup_found = True
                break
        
        time.sleep(0.5)
        print(f"  Checking... {int(time.time() - start_time)}s")
    
    if not popup_found:
        print(f"\n❌ No ML popup appeared within {timeout} seconds")
        
        # Debug info
        current_url = page.url
        print(f"🌐 Current URL: {current_url}")
        
        # Check page content
        page_content = page.content()
        
        if 'ml-captcha-popup' in page_content:
            print("✅ '#ml-captcha-popup' exists in HTML")
        else:
            print("❌ '#ml-captcha-popup' NOT in HTML")
        
        if 'security-check.js' in page_content:
            print("✅ 'security-check.js' is loaded")
        else:
            print("❌ 'security-check.js' NOT loaded")
        
        # Show console messages
        print("\n📝 Console messages:")
        ml_msgs = [m for m in console_messages if any(
            keyword in m['text'].lower() 
            for keyword in ['ml', 'captcha', 'predict', 'feature', 'bot', 'human', 'error']
        )]
        
        if ml_msgs:
            for msg in ml_msgs[-5:]:
                print(f"   [{msg['type']}] {msg['text']}")
        else:
            print("   No ML-related console messages")
        
        # Take debug screenshot
        page.screenshot(path="tests/no_popup_debug.png")
        print(f"\n📸 Debug screenshot saved: tests/no_popup_debug.png")
        
        assert False, f"No ML popup appeared within {timeout} seconds"
    
    # Wait to see popup
    time.sleep(3)
    print("\n" + "=" * 50)
    print("✅ Test complete")

# Add a main function to run directly
if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    
    print("🚀 Running ML CAPTCHA Bot Detection Test")
    print("=" * 50)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            test_bot_detection_ml_captcha(page)
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            # Keep browser open
            print("\n🔍 Browser open for 10 seconds...")
            print("Check top-right for ML popup!")
            time.sleep(10)
            browser.close()