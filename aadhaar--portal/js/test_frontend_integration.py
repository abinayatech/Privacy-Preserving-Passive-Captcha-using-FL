# test_frontend_integration.py
from playwright.sync_api import sync_playwright
import time

def test_frontend():
    print("🌐 Testing Frontend Integration...")
    print("=" * 50)
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Navigate to the page
            print("1️⃣ Loading page...")
            page.goto('http://localhost:5000/')
            time.sleep(2)
            
            # Check page loaded
            title = page.title()
            print(f"✅ Page loaded: {title}")
            
            # Check for key elements
            print("\n2️⃣ Checking UI elements...")
            
            # Check form exists
            has_form = page.locator('#verifyForm').count() > 0
            print(f"   Form: {'✅' if has_form else '❌'}")
            
            # Check input field
            has_input = page.locator('#verifyAadhaar').count() > 0
            print(f"   Input field: {'✅' if has_input else '❌'}")
            
            # Check ML progress bar
            has_progress = page.locator('.ml-progress-container').count() > 0
            print(f"   ML Progress bar: {'✅' if has_progress else '❌'}")
            
            # Simulate human interaction
            print("\n3️⃣ Simulating human interaction...")
            
            # Move mouse randomly
            print("   Moving mouse...")
            for i in range(10):
                page.mouse.move(100 + i*10, 200 + i*10)
                time.sleep(0.1)
            
            # Type naturally
            print("   Typing...")
            page.fill('#verifyAadhaar', '')
            for char in "1234 5678 9012":
                page.keyboard.type(char)
                time.sleep(0.1 + 0.05 * (i % 3))  # Natural variation
            
            # Click submit button
            print("\n4️⃣ Testing ML CAPTCHA...")
            submit_btn = page.locator('#submitBtn')
            submit_btn.click()
            
            # Wait for ML response
            time.sleep(3)
            
            # Check for popup
            print("\n5️⃣ Checking ML response...")
            has_popup = page.evaluate('''() => {
                const popup = document.getElementById('ml-security-popup');
                return popup !== null;
            }''')
            
            if has_popup:
                print("✅ ML Popup detected!")
                
                # Get popup content
                popup_text = page.evaluate('''() => {
                    const popup = document.getElementById('ml-security-popup');
                    return popup.innerText;
                }''')
                
                print(f"   Popup content:\n   {popup_text[:100]}...")
            else:
                print("❌ No ML popup detected")
            
            # Check console logs
            print("\n6️⃣ Checking browser console...")
            logs = page.evaluate('''() => {
                const logs = [];
                const originalLog = console.log;
                console.log = function(...args) {
                    logs.push(args.join(' '));
                    originalLog.apply(console, args);
                };
                return logs;
            }''')
            
            ml_logs = [log for log in logs if 'ML' in log or 'FL' in log or 'human' in log.lower()]
            print(f"   Found {len(ml_logs)} ML/FL related logs")
            
            if ml_logs:
                print("   Recent ML logs:")
                for log in ml_logs[-3:]:
                    print(f"   - {log[:80]}...")
            
            # Take screenshot
            print("\n7️⃣ Taking screenshot...")
            page.screenshot(path='frontend_test.png')
            print("✅ Screenshot saved: frontend_test.png")
            
            print("\n" + "=" * 50)
            print("🎉 FRONTEND TEST COMPLETE!")
            print("   Open frontend_test.png to see the result")
            print("   Check browser console for detailed ML logs")
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Close browser
            time.sleep(2)
            browser.close()

if __name__ == '__main__':
    print("⚠️ Make sure Flask server is running!")
    print("   Command: python flask_server.py")
    print("   Then press Enter to continue...")
    input()
    
    test_frontend()