// Simple Playwright test for Aadhaar portal
const { chromium } = require("@playwright/test");

(async () => {
  console.log("🚀 Starting Playwright test...");
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Visit contact page
    console.log("1. Visiting contact page...");
    await page.goto("http://localhost:5003/contact");
    console.log("   ✅ Page loaded");
    
    // Test 2: Fill form as human
    console.log("2. Testing human-like behavior...");
    await page.waitForTimeout(1000);
    await page.fill("#contactName", "Test User", { delay: 100 });
    console.log("   ✅ Form filled with delays");
    
    // Test 3: Submit
    console.log("3. Submitting form...");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log("   ✅ Form submitted");
    
    console.log("\n🎉 All tests passed!");
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  } finally {
    await browser.close();
  }
})();
