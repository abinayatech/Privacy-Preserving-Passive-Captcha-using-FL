# test_popup_duration.py
from playwright.sync_api import sync_playwright
import time

print("🔍 TESTING POPUP DURATION")
print("=" * 50)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Go to page
    page.goto("http://localhost:5000/verify.html")
    time.sleep(3)
    
    print("✅ Page loaded")
    
    # Listen to console
    console_msgs = []
    def handle_console(msg):
        text = msg.text
        console_msgs.append(f"{time.time():.1f}: {text}")
        if "popup" in text.lower() or "showing" in text.lower() or "hiding" in text.lower():
            print(f"   {text}")
    
    page.on("console", handle_console)
    
    # TEST: Fill and submit
    print("\n Testing bot detection (instant fill)...")
    page.fill('input[name="aadhaar_number"]', '123456789012', force=True)
    page.click('button[type="submit"]', force=True)
    
    print(" Timing popup duration...")
    
    popup_start_time = None
    popup_end_time = None
    popup_visible_duration = 0
    
    # Monitor for 15 seconds
    for i in range(15):
        time.sleep(1)
        
        # Check popup visibility
        popup_state = page.evaluate("""
            () => {
                const popup = document.getElementById('ml-captcha-popup');
                if (!popup) return {visible: false};
                
                const style = window.getComputedStyle(popup);
                const visible = style.display !== 'none';
                
                return {
                    visible: visible,
                    text: popup.innerText,
                    className: popup.className
                };
            }
        """)
        
        if popup_state['visible']:
            if popup_start_time is None:
                popup_start_time = time.time()
                print(f" Popup appeared at {i+1}s: {popup_state['text'][:50]}...")
            
            # Take screenshot every 2 seconds while popup is visible
            if i % 2 == 0:
                page.screenshot(path=f"popup_visible_{i}s.png")
        else:
            if popup_start_time is not None and popup_end_time is None:
                popup_end_time = time.time()
                popup_visible_duration = popup_end_time - popup_start_time
                print(f"  Popup disappeared after {popup_visible_duration:.1f} seconds")
                break
    
    if popup_start_time is not None and popup_end_time is None:
        popup_visible_duration = 15  # Was visible entire time
        print(f"  Popup still visible after 15 seconds")
    
    # Results
    print(f"\n POPUP DURATION RESULTS:")
    print(f"   Visible for: {popup_visible_duration:.1f} seconds")
    
    if popup_visible_duration < 3:
        print("     Too short! Should be 5-10 seconds")
    elif popup_visible_duration >= 5:
        print("    Good duration!")
    
    # Take final screenshot
    page.screenshot(path="popup_final_result.png")
    print(f"\n Screenshots saved: popup_visible_*.png")
    
    # Show console messages about popup
    print(f"\n Console messages about popup:")
    popup_msgs = [msg for msg in console_msgs if "popup" in msg.lower() or "show" in msg.lower()]
    for msg in popup_msgs[-5:]:
        print(f"   {msg}")
    
    print("\n Check screenshots - popup should be visible for several seconds")
    input("Press Enter to close browser...")
    browser.close()

print("\n" + "=" * 50)
print(" Duration test complete")
