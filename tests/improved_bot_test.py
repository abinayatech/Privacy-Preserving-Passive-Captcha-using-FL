# tests/improved_bot_test.py
from playwright.sync_api import sync_playwright
import time

print("🎯 IMPROVED ML CAPTCHA TEST")
print("=" * 60)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Go to verify page
    page.goto("http://localhost:5000/verify.html")
    time.sleep(3)
    
    print("✅ Page loaded")
    
    # Listen to console
    console_msgs = []
    def handle_console(msg):
        text = msg.text
        console_msgs.append(text)
        if "ML" in text or "predict" in text or "confidence" in text:
            print(f"   Console: {text}")
    
    page.on("console", handle_console)
    
    # EXTREME BOT SIMULATION
    print("\n🤖 SIMULATING EXTREME BOT...")
    
    # Clear cache and ensure fresh session
    page.evaluate("localStorage.clear(); sessionStorage.clear();")
    
    # Find input
    input_field = page.locator('input[name="aadhaar_number"]')
    
    if input_field.count() > 0:
        # BOT 1: Fill INSTANTLY
        print("⚡ Filling instantly...")
        input_field.fill("123456789012", force=True)
        
        # BOT 2: Submit INSTANTLY
        print("🚀 Submitting instantly...")
        submit_button = page.locator('button[type="submit"]')
        submit_button.click(force=True)
        
        print("⏳ Waiting for ML response...")
        
        # Check for 15 seconds
        bot_detected = False
        for i in range(15):
            time.sleep(1)
            
            # Check console for ML response
            recent = console_msgs[-3:] if len(console_msgs) > 3 else console_msgs
            for msg in recent:
                if "RECEIVED from ML" in msg:
                    print(f"   ML Response: {msg}")
                    
                    # Parse confidence
                    import re
                    conf_match = re.search(r'confidence:\s*([\d.]+)', msg)
                    hum_match = re.search(r'is_human:\s*(true|false)', msg)
                    
                    if conf_match and hum_match:
                        conf = float(conf_match.group(1))
                        is_human = hum_match.group(1) == 'true'
                        
                        print(f"   Confidence: {conf}, Is Human: {is_human}")
                        
                        if not is_human and conf < 0.75:
                            print("🎉 BOT DETECTED!")
                            bot_detected = True
                            break
                        elif is_human and conf > 0.75:
                            print("❌ HUMAN (bot not detected)")
            
            # Check for visible popup
            popup_visible = page.evaluate("""
                () => {
                    const popup = document.getElementById('ml-captcha-popup');
                    if (!popup) return {visible: false, text: ''};
                    
                    const style = window.getComputedStyle(popup);
                    const visible = style.display !== 'none' && 
                                  style.visibility !== 'hidden';
                    
                    return {
                        visible: visible,
                        text: popup.innerText,
                        html: popup.innerHTML,
                        class: popup.className
                    };
                }
            """)
            
            if popup_visible['visible'] and popup_visible['text'].strip():
                print(f"\n🎉 POPUP VISIBLE: {popup_visible['text']}")
                print(f"   Class: {popup_visible['class']}")
                print(f"   HTML: {popup_visible['html'][:100]}...")
                
                if "BOT" in popup_visible['text'].upper():
                    print("✅ BOT DETECTED IN POPUP!")
                    bot_detected = True
                    break
                elif "HUMAN" in popup_visible['text'].upper():
                    print("⚠️  HUMAN DETECTED (bot not caught)")
                    break
            
            if bot_detected:
                break
        
        if bot_detected:
            print("\n✅ SUCCESS: ML CAPTCHA detected bot!")
        else:
            print("\n❌ FAILURE: Bot not detected")
            
            # Debug info
            print("\n🔧 DEBUG INFO:")
            
            # Check popup HTML
            popup_html = page.evaluate("""
                () => {
                    const popup = document.getElementById('ml-captcha-popup');
                    return popup ? popup.outerHTML : 'No popup element';
                }
            """)
            print(f"Popup HTML: {popup_html[:200]}...")
            
            # Check if popup has content
            popup_content = page.evaluate("""
                () => {
                    const popup = document.getElementById('ml-captcha-popup');
                    if (!popup) return 'NO POPUP';
                    return {
                        innerText: popup.innerText,
                        innerHTML: popup.innerHTML,
                        styleDisplay: popup.style.display,
                        className: popup.className
                    };
                }
            """)
            print(f"Popup Content: {popup_content}")
    
    else:
        print("❌ Input field not found!")
    
    # Take screenshot
    page.screenshot(path="tests/final_test_result.png")
    print("\n📸 Screenshot saved: tests/final_test_result.png")
    
    print("\n🔍 Browser open for inspection...")
    print("Press Enter to close browser...")
    input()
    browser.close()

print("\n" + "=" * 60)
print("✅ Test complete")
