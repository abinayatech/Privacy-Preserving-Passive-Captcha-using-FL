# test_all_pages_popup.py
from playwright.sync_api import sync_playwright
import time

pages = [
    ("verify.html", "Verify Aadhaar"),
    ("check-status.html", "Check Status"), 
    ("download.html", "Download Aadhaar"),
    ("update.html", "Update Aadhaar"),
    ("contact.html", "Contact Us")
]

print("🎯 TESTING POPUP ON ALL PAGES")
print("=" * 50)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    
    for page_name, page_title in pages:
        print(f"\n🌐 Testing: {page_title} ({page_name})")
        
        page = browser.new_page()
        page.goto(f"http://localhost:5000/{page_name}")
        time.sleep(2)
        
        # Check if popup function exists
        has_function = page.evaluate("""
            () => {
                return typeof showMLPopup === 'function';
            }
        """)
        
        if has_function:
            print("   ✅ showMLPopup function exists")
            
            # Find and fill first form
            form_count = page.evaluate("""
                () => {
                    return document.querySelectorAll('form').length;
                }
            """)
            
            print(f"   📋 Forms on page: {form_count}")
            
            if form_count > 0:
                # Fill form with human-like behavior
                inputs = page.locator('input[type="text"], input[type="email"]').all()
                if inputs:
                    # Type slowly
                    for char in "Test Input":
                        inputs[0].type(char, delay=100)
                        time.sleep(0.05)
                
                # Submit form
                submit_buttons = page.locator('button[type="submit"]').all()
                if submit_buttons:
                    submit_buttons[0].click()
                    
                    # Check for popup
                    time.sleep(3)
                    
                    popup_result = page.evaluate("""
                        () => {
                            const popup = document.getElementById('ml-popup');
                            if (popup && popup.style.display !== 'none') {
                                return {
                                    text: popup.textContent,
                                    class: popup.className,
                                    visible: true
                                };
                            }
                            return {visible: false};
                        }
                    """)
                    
                    if popup_result['visible']:
                        print(f"   🎯 POPUP FOUND: {popup_result['text']} ({popup_result['class']})")
                    else:
                        print("   ❌ No popup appeared")
                        
                        # Take debug screenshot
                        page.screenshot(path=f"debug_{page_name}_no_popup.png")
                        print(f"   📸 Debug screenshot: debug_{page_name}_no_popup.png")
        else:
            print("   ❌ showMLPopup function NOT found")
            
        page.close()
        time.sleep(1)
    
    print("\n" + "=" * 50)
    print("✅ All pages tested!")
    
    browser.close()
