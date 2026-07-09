# tests/playwright_bot_detection_fixed.py
from playwright.sync_api import sync_playwright
import time

def test_bot_detection():
    """Test ML CAPTCHA detects Playwright automation as BOT"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("🤖 STARTING ML CAPTCHA BOT DETECTION TEST")
        print("=" * 60)
        
        try:
            # 1. Navigate to verify page
            print("🌐 Navigating to: http://localhost:5000/verify.html")
            page.goto("http://localhost:5000/verify.html", wait_until='networkidle')
            time.sleep(2)
            
            print(f"✅ Page loaded: {page.title()}")
            
            # 2. Check if ML JavaScript is loaded
            print("\n🔍 Checking ML CAPTCHA setup...")
            
            # Check console for initialization
            console_messages = []
            def handle_console(msg):
                console_messages.append(msg.text)
                if "ML" in msg.text.upper() or "CAPTCHA" in msg.text.upper():
                    print(f"   Console: {msg.text}")
            
            page.on("console", handle_console)
            
            # Check if ML functions exist
            ml_loaded = page.evaluate('''
                () => {
                    console.log("Checking ML functions...");
                    
                    // Check if our ML event listeners are set up
                    const form = document.getElementById('verifyForm');
                    if (form) {
                        console.log("Form found, checking event listeners...");
                        
                        // Trigger a test to see if features are tracked
                        const testEvent = new Event('mouseenter', { bubbles: true });
                        document.dispatchEvent(testEvent);
                        
                        return true;
                    }
                    return false;
                }
            ''')
            
            print("✅ Page is ready for testing")
            
            # 3. SIMULATE EXTREME BOT BEHAVIOR
            print("\n🤖 SIMULATING BOT BEHAVIOR...")
            print("   - INSTANT form fill")
            print("   - NO mouse movements")
            print("   - IMMEDIATE submit")
            
            # BOT BEHAVIOR 1: Fill form INSTANTLY (no human delay)
            print("\n📝 Filling Aadhaar field INSTANTLY...")
            aadhaar_input = page.locator('input[name="aadhaar_number"]')
            if aadhaar_input.count() > 0:
                aadhaar_input.first.fill('1234 5678 9012', force=True)
                print("✅ Field filled instantly (bot-like)")
            else:
                print("❌ Could not find input field!")
                page.screenshot(path='tests/bot_test_no_input.png')
                return
            
            # BOT BEHAVIOR 2: Submit instantly (no delay)
            print("🚀 Submitting form INSTANTLY...")
            
            # Find and click submit button
            submit_button = page.locator('button[type="submit"]')
            if submit_button.count() > 0:
                submit_button.first.click(force=True)
                print("✅ Form submitted instantly (bot-like)")
            else:
                # Try any button
                any_button = page.locator('button').first
                if any_button.count() > 0:
                    any_button.click(force=True)
                else:
                    print("❌ No submit button found!")
            
            # 4. WAIT FOR ML CAPTCHA POPUP
            print("\n⏳ Waiting for ML CAPTCHA response...")
            print("   Looking for: #ml-captcha-popup")
            
            popup_found = False
            start_time = time.time()
            
            # Check for 15 seconds
            for i in range(15):
                time.sleep(1)
                print(f"   Checking... {i+1}/15 seconds")
                
                # Check for ML popup
                popup = page.locator('#ml-captcha-popup')
                
                if popup.count() > 0:
                    if popup.is_visible():
                        popup_text = popup.inner_text()
                        print(f"\n✅ ML CAPTCHA POPUP FOUND!")
                        print(f"📢 Message: {popup_text}")
                        
                        if "BOT" in popup_text.upper():
                            print("🎉 SUCCESS: ML system correctly detected BOT!")
                            
                            # Check popup color
                            popup_color = popup.evaluate('''
                                (element) => {
                                    return window.getComputedStyle(element).backgroundColor;
                                }
                            ''')
                            print(f"🎨 Popup color: {popup_color}")
                            
                            # Take success screenshot
                            page.screenshot(path='tests/bot_detected_success.png')
                            print("📸 Screenshot saved: tests/bot_detected_success.png")
                            
                        elif "HUMAN" in popup_text.upper():
                            print("❌ FAILURE: ML detected bot as HUMAN")
                            print("   Increase threshold in flask_server.py")
                            
                            page.screenshot(path='tests/false_human.png')
                            print("📸 Screenshot saved: tests/false_human.png")
                        
                        popup_found = True
                        break
            
            if not popup_found:
                print(f"\n❌ NO ML POPUP APPEARED after 15 seconds")
                
                # Debug info
                current_url = page.url
                print(f"🌐 Current URL: {current_url}")
                
                # Check page content
                content = page.content()
                
                # Check for ML popup in HTML
                if '#ml-captcha-popup' in content:
                    print("✅ #ml-captcha-popup exists in HTML (but not visible)")
                else:
                    print("❌ #ml-captcha-popup NOT in HTML")
                
                # Check for JavaScript
                if 'security-check.js' in content:
                    print("✅ security-check.js is loaded")
                else:
                    print("❌ security-check.js NOT loaded")
                
                # Show console messages
                print("\n📝 Console messages:")
                ml_msgs = [msg for msg in console_messages if any(
                    keyword in msg.lower() 
                    for keyword in ['ml', 'captcha', 'predict', 'feature', 'bot', 'human']
                )]
                
                if ml_msgs:
                    for msg in ml_msgs[-5:]:
                        print(f"   {msg}")
                else:
                    print("   No ML-related console messages")
                
                # Take debug screenshot
                page.screenshot(path='tests/no_popup_debug.png')
                print("\n📸 Debug screenshot saved: tests/no_popup_debug.png")
                
                # Check if form actually submitted
                if 'verify' in current_url or 'aadhaar' in current_url:
                    print("⚠️  Form was submitted (page changed)")
                else:
                    print("⚠️  Form may not have been submitted")
            
            print("\n" + "=" * 60)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            # Keep browser open for inspection
            print("\n🔍 Browser will stay open for 15 seconds...")
            print("Check top-right corner for ML popup!")
            try:
                time.sleep(15)
            except KeyboardInterrupt:
                print("\nClosing browser...")
            
            browser.close()

# Also create a human simulation for comparison
def test_human_simulation():
    """Test that human behavior passes as HUMAN"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("\n" + "=" * 60)
        print("🧑 SIMULATING HUMAN BEHAVIOR")
        print("=" * 60)
        
        try:
            page.goto("http://localhost:5000/verify.html")
            time.sleep(2)
            
            print("Simulating human behavior...")
            print("   - Natural mouse movements")
            print("   - Typing with delays")
            print("   - Thinking time")
            
            # Human-like mouse movements
            page.mouse.move(100, 100)
            time.sleep(0.2)
            page.mouse.move(200, 150)
            time.sleep(0.3)
            page.mouse.move(150, 200)
            
            # Click on input
            page.click('input[name="aadhaar_number"]')
            time.sleep(0.5)
            
            # Type with human-like delays
            aadhaar = "1234 5678 9012"
            for char in aadhaar:
                page.keyboard.type(char)
                time.sleep(0.1 + (ord(char) % 3) * 0.05)  # Random variation
            
            # Think before submitting
            time.sleep(1.5)
            
            # Submit
            page.click('button[type="submit"]')
            
            print("⏳ Waiting for ML response...")
            time.sleep(5)
            
            # Check popup
            popup = page.locator('#ml-captcha-popup')
            if popup.count() > 0 and popup.is_visible():
                popup_text = popup.inner_text()
                print(f"\n✅ Human test popup: {popup_text}")
                
                if "HUMAN" in popup_text.upper():
                    print("🎉 Human behavior correctly detected as HUMAN")
                else:
                    print(f"⚠️  Human behavior got: {popup_text}")
            else:
                print("❌ No popup in human test")
            
            time.sleep(3)
            
        finally:
            browser.close()

if __name__ == "__main__":
    print("🚀 ML CAPTCHA BOT DETECTION TEST")
    print("Make sure Flask is running: python flask_server.py")
    print("=" * 60)
    
    # Run bot test
    test_bot_detection()
    
    # Optional: Run human test for comparison
    # Uncomment to run both
    # test_human_simulation()