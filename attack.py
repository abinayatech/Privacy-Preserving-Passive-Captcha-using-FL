# attack_test.py
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Go to verify page
    page.goto("http://localhost:5000/verify.html")
    
    # Fill form quickly (bot-like behavior)
    page.fill('input[name="aadhaar_number"]', '123456789012')
    
    # Submit without natural delays
    page.click('button[type="submit"]')
    
    print("🤖 Attack sent! Check dashboard...")
    
    browser.close()