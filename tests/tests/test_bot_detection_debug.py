# tests/test_bot_detection_debug.py
import asyncio
from playwright.async_api import async_playwright
import time

async def test_bot_detection():
    async with async_playwright() as p:
        # Launch browser in headed mode for debugging
        browser = await p.chromium.launch(headless=False, slow_mo=100)  # Added slow_mo to see what's happening
        context = await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to Aadhaar portal...")
        await page.goto('http://localhost:5000/aadhaar-portal/verify.html')
        
        # Wait for page to load
        await page.wait_for_load_state('networkidle')
        print("Page loaded")
        
        # Take screenshot before interaction
        await page.screenshot(path='tests/screenshots/before_form.png')
        
        # Check if JavaScript is loaded
        js_status = await page.evaluate('''() => {
            const script = Array.from(document.scripts).find(s => 
                s.src.includes('security-check.js') || s.src.includes('security-check')
            );
            return script ? 'JS Loaded' : 'JS Not Found';
        }''')
        print(f"JavaScript status: {js_status}")
        
        # Fill the form with bot-like behavior (very fast)
        print("Filling form with bot-like behavior...")
        aadhaar_input = page.locator('#aadhaar_number')
        await aadhaar_input.fill('123456789012')
        
        # Minimal delay to simulate bot
        await page.wait_for_timeout(100)
        
        # Take screenshot after filling form
        await page.screenshot(path='tests/screenshots/after_fill.png')
        
        # Click the submit button normally (this triggers JavaScript)
        print("Clicking submit button...")
        submit_button = page.locator('#submitBtn')
        
        # Set up dialog handler BEFORE clicking
        dialog_message = None
        
        def handle_dialog(dialog):
            nonlocal dialog_message
            dialog_message = dialog.message
            print(f"Dialog appeared: {dialog_message}")
            dialog.accept()  # Accept the alert
        
        page.on('dialog', handle_dialog)
        
        # Click the submit button
        await submit_button.click()
        
        # Wait for potential alert/dialog
        await page.wait_for_timeout(2000)
        
        # Check if alert was shown
        if dialog_message:
            print(f"SUCCESS: Alert shown - {dialog_message}")
            
            # Check if it's the bot detection alert
            if 'BOT DETECTED' in dialog_message:
                print("✓ Bot correctly detected!")
                return True
            elif 'HUMAN DETECTED' in dialog_message:
                print("✗ Bot incorrectly classified as human")
                return False
        else:
            print("ERROR: No alert/dialog appeared")
            
            # Check if form was submitted anyway
            current_url = page.url
            print(f"Current URL: {current_url}")
            
            if 'aadhaar_number=' in current_url:
                print("Form was submitted without ML check!")
                
                # Check Flask logs for prediction requests
                print("Check Flask console for prediction requests...")
            
            # Take screenshot after submission attempt
            await page.screenshot(path='tests/screenshots/after_submit.png')
            
            # Check JavaScript console for errors
            console_messages = []
            page.on('console', lambda msg: console_messages.append(msg.text))
            
            # Reload and try to trigger JavaScript errors
            await page.reload()
            await page.wait_for_timeout(1000)
            
            if console_messages:
                print("Console messages:", console_messages)
            
            return False
        
        await browser.close()

async def main():
    result = await test_bot_detection()
    if result:
        print("\n✅ Test PASSED: Bot detection working!")
    else:
        print("\n❌ Test FAILED: Bot detection not working")

if __name__ == '__main__':
    asyncio.run(main())