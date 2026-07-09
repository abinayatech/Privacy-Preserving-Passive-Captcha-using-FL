# tests/test_bot_simulation.py
from playwright.sync_api import sync_playwright
import time
import random

print("🤖 PROPER BOT SIMULATION TEST")
print("=" * 70)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    try:
        # Go to verify page (which has forms)
        url = "http://127.0.0.1:5000/verify.html"
        print(f"🌐 Opening: {url}")
        page.goto(url, wait_until='networkidle')
        time.sleep(2)
        
        print(f"📄 Page: {page.title()}")
        print(f"📍 URL: {page.url}")
        
        # Check for ML popup
        has_popup = page.evaluate("""
            () => document.getElementById('ml-captcha-popup') !== null
        """)
        print(f"✅ ml-captcha-popup: {has_popup}")
        
        if not has_popup:
            print("❌ ML popup container missing! Add it to verify.html")
            return False
        
        # PROPER BOT SIMULATION TECHNIQUES
        print("\n" + "=" * 60)
        print("🤖 SIMULATING REAL BOT BEHAVIOR")
        print("=" * 60)
        
        # TECHNIQUE 1: JavaScript direct injection (no mouse/keyboard events)
        print("\n💉 Technique 1: Direct JavaScript injection")
        page.evaluate("""
            // Find Aadhaar input
            const input = document.querySelector('input[name="aadhaar_number"]') || 
                          document.querySelector('input[type="text"]');
            
            if (input) {
                // BOT-LIKE: Set value directly (no events)
                input.value = '999999999999';
                console.log('BOT: Direct JS fill complete');
                
                // BOT-LIKE: Trigger ML check if function exists
                if (typeof sendToMLModel === 'function') {
                    console.log('BOT: Calling ML model...');
                    sendToMLModel();
                }
            }
        """)
        
        time.sleep(1)
        
        # TECHNIQUE 2: Playwright instant fill
        print("⚡ Technique 2: Playwright instant fill")
        page.fill('input', '999999999999', force=True)
        
        # TECHNIQUE 3: Direct form submission
        print("🚀 Technique 3: Direct form submission")
        page.evaluate("""
            const form = document.querySelector('form');
            if (form) {
                // Remove action to prevent navigation
                form.removeAttribute('action');
                form.removeAttribute('method');
                
                // Submit but prevent default
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('BOT: Form submission intercepted');
                });
            }
        """)
        
        # Wait for ML response
        print("\n⏳ Waiting for ML CAPTCHA response...")
        print("   Looking for #ml-captcha-popup")
        
        start_time = time.time()
        timeout = 15
        popup_found = False
        
        while time.time() - start_time < timeout:
            elapsed = time.time() - start_time
            
            # Check if popup is visible
            popup_visible = page.evaluate("""
                () => {
                    const popup = document.getElementById('ml-captcha-popup');
                    if (!popup) return false;
                    
                    const style = window.getComputedStyle(popup);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' &&
                           style.opacity !== '0';
                }
            """)
            
            if popup_visible:
                # Get popup text
                popup_text = page.evaluate("""
                    () => {
                        const popup = document.getElementById('ml-captcha-popup');
                        return popup ? popup.innerText : '';
                    }
                """)
                
                print(f"\n✅ ML POPUP APPEARED after {elapsed:.1f}s")
                print(f"📄 Text: {popup_text}")
                
                if "BOT" in popup_text.upper():
                    print("🎉🎉🎉 SUCCESS! BOT DETECTED!")
                    
                    # Check popup color
                    popup_color = page.evaluate("""
                        () => {
                            const popup = document.getElementById('ml-captcha-popup');
                            return popup ? window.getComputedStyle(popup).backgroundColor : '';
                        }
                    """)
                    
                    print(f"🎨 Popup color: {popup_color}")
                    
                    # Take screenshot
                    page.screenshot(path='tests/bot_detected_proper.png')
                    print("📸 Screenshot saved: tests/bot_detected_proper.png")
                    
                    popup_found = True
                    break
                elif "HUMAN" in popup_text.upper():
                    print("❌ FAILURE: Bot detected as HUMAN")
                    print("   ML threshold needs to be higher (0.99)")
                    break
            
            # Print progress every 3 seconds
            if int(elapsed) % 3 == 0 and int(elapsed) > 0 and not popup_found:
                print(f"   Still waiting... {int(elapsed)}s elapsed")
            
            time.sleep(0.5)
        
        if not popup_found:
            print(f"\n❌ No ML popup after {timeout} seconds")
            
            # Debug: Check console
            console_msgs = page.evaluate("""
                () => {
                    // Check if there were any console logs
                    const bodyHtml = document.body.innerHTML;
                    return {
                        hasSendToMLModel: bodyHtml.includes('sendToMLModel'),
                        hasMLCaptcha: bodyHtml.includes('ml-captcha'),
                        hasSecurityJS: bodyHtml.includes('security-check.js')
                    };
                }
            """)
            
            print(f"🔍 Debug: {console_msgs}")
            
            # Take screenshot
            page.screenshot(path='tests/no_popup_debug.png')
            print("📸 Debug screenshot saved")
        
        # Compare with human behavior
        print("\n" + "=" * 60)
        print("🧑 HUMAN BEHAVIOR SIMULATION (for comparison)")
        print("=" * 60)
        
        response = input("\nTest human behavior for comparison? (y/n): ")
        if response.lower() == 'y':
            print("\n🌐 Opening new page for human test...")
            page2 = browser.new_page()
            page2.goto("http://127.0.0.1:5000/verify.html")
            time.sleep(2)
            
            print("🧑 Simulating human behavior...")
            
            # Human-like mouse movements
            for i in range(10):
                x = 200 + random.randint(-30, 30) + i * 25
                y = 300 + random.randint(-20, 20) + i * 15
                page2.mouse.move(x, y)
                time.sleep(random.uniform(0.1, 0.3))
            
            # Click input
            page2.click('input')
            time.sleep(0.5)
            
            # Type naturally
            aadhaar = "1234 5678 9012"
            for char in aadhaar:
                page2.keyboard.type(char)
                time.sleep(random.uniform(0.08, 0.18))
                
                # Occasional "mistakes"
                if random.random() > 0.9:
                    page2.keyboard.press('Backspace')
                    time.sleep(0.1)
                    page2.keyboard.type(char)
            
            time.sleep(1)
            
            print("⏳ Waiting for human result...")
            time.sleep(5)
            
            # Check human result
            popup_visible = page2.evaluate("""
                () => {
                    const popup = document.getElementById('ml-captcha-popup');
                    return popup && popup.style.display !== 'none';
                }
            """)
            
            if popup_visible:
                popup_text = page2.evaluate("""
                    () => {
                        const popup = document.getElementById('ml-captcha-popup');
                        return popup ? popup.innerText : '';
                    }
                """)
                print(f"🧑 Human result: {popup_text}")
            else:
                print("✅ No popup for human (expected)")
            
            page2.screenshot(path='tests/human_comparison.png')
            page2.close()
        
        return popup_found
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        print("\n🔍 Browser open for inspection...")
        time.sleep(10)
        browser.close()

if __name__ == "__main__":
    print("🚀 PROPER BOT SIMULATION TEST")
    print("=" * 70)
    print("Testing on: http://127.0.0.1:5000/verify.html")
    print("Using real bot techniques:")
    print("1. JavaScript direct injection")
    print("2. Instant form fills")
    print("3. No mouse/keyboard events")
    print("=" * 70)
    
    success = None
    try:
        success = exec(open(__file__).read())
    except:
        pass
    
    if success:
        print("\n" + "=" * 70)
        print("🎉 SUCCESS! Bot behavior properly simulated!")
        print("=" * 70)
    else:
        print("\n" + "=" * 70)
        print("❌ TEST FAILED")
        print("\n🔧 TROUBLESHOOTING:")
        print("1. Add ml-captcha-popup to verify.html")
        print("2. Make sure security-check.js is loaded")
        print("3. Check Flask threshold is 0.99")
        print("4. Check browser console for errors")
        print("=" * 70)