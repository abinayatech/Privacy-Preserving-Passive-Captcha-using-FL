const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

console.log("🤖 Starting Playwright data generation...\n");

async function generateBehaviorData(label, count) {
  console.log(`Generating ${count} ${label} samples...`);
  
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const startTime = Date.now();
    const features = {
      mouseMoves: 0,
      totalDistance: 0,
      keyTimes: [],
      scrolls: 0,
      focusSwitches: 0,
      lastX: null,
      lastY: null
    };
    
    // Track mouse
    page.on("mousemove", (event) => {
      features.mouseMoves++;
      if (features.lastX !== null && features.lastY !== null) {
        const dist = Math.sqrt(
          Math.pow(event.x - features.lastX, 2) + 
          Math.pow(event.y - features.lastY, 2)
        );
        features.totalDistance += dist;
      }
      features.lastX = event.x;
      features.lastY = event.y;
    });
    
    // Track keys
    page.on("keydown", () => {
      features.keyTimes.push(Date.now());
    });
    
    // Go to your Aadhaar contact page
    try {
      await page.goto("http://localhost:5003/contact");
    } catch (err) {
      console.log(`   ⚠️ Could not load page: ${err.message}`);
      await browser.close();
      continue;
    }
    
    if (label === "human") {
      // Human behavior
      await page.waitForTimeout(800 + Math.random() * 1500);
      await page.mouse.move(100, 100);
      await page.waitForTimeout(200);
      await page.mouse.move(150, 120);
      await page.fill("#contactName", `HumanUser${i}`, { 
        delay: 80 + Math.random() * 200 
      });
    } else {
      // Bot behavior
      await page.fill("#contactName", `BotUser${i}`, { delay: 0 });
      await page.click('button[type="submit"]');
    }
    
    // Calculate average key interval
    let avgKeyInterval = 0;
    if (features.keyTimes.length > 1) {
      const intervals = [];
      for (let j = 1; j < features.keyTimes.length; j++) {
        intervals.push(features.keyTimes[j] - features.keyTimes[j-1]);
      }
      avgKeyInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }
    
    results.push({
      mouseMoves: features.mouseMoves,
      totalDistance: Math.round(features.totalDistance),
      avgKeyInterval: Math.round(avgKeyInterval),
      scrolls: features.scrolls,
      focusSwitches: features.focusSwitches,
      label: label
    });
    
    await browser.close();
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`   Generated ${i + 1}/${count} ${label} samples`);
    }
  }
  
  return results;
}

async function main() {
  // Check if server is running
  console.log("Checking if Aadhaar portal is running...");
  console.log("Make sure your server is at: http://localhost:5003\n");
  
  // Generate 50 of each for testing
  const humanData = await generateBehaviorData("human", 50);
  const botData = await generateBehaviorData("bot", 50);
  
  // Combine
  const allData = [...humanData, ...botData];
  
  // Create CSV content
  const header = "mouseMoves,totalDistance,avgKeyInterval,scrolls,focusSwitches,label\n";
  const csvContent = allData.map(row => 
    `${row.mouseMoves},${row.totalDistance},${row.avgKeyInterval},` +
    `${row.scrolls},${row.focusSwitches},${row.label}`
  ).join("\n");
  
  // Save to main folder
  const outputPath = path.join(__dirname, "..", "balanced_playwright_data.csv");
  fs.writeFileSync(outputPath, header + csvContent);
  
  console.log(`\n✅ Generated ${allData.length} balanced samples`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`   Humans: ${humanData.length}, Bots: ${botData.length}`);
}

main().catch(console.error);
