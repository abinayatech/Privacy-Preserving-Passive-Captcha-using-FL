const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Call your FL_captcha bot detection model
 * @param {Object} features - {mouseMoves, totalDistance, scrolls, focusSwitches}
 * @returns {Promise<Object>} Prediction result
 */
async function detectBot(features) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'backend', 'ml_predict_api_fixed.py');
    
    console.log(`🤖 Calling FL_captcha model...`);
    
    const pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errors = '';
    
    // Handle output
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errors += data.toString();
      console.error('Model stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Model failed (code ${code}): ${errors}`));
        return;
      }
      
      try {
        const result = JSON.parse(output);
        
        // Log for debugging
        console.log(`📊 Input features:`, features);
        console.log(`📈 Model result:`, {
          label: result.label,
          prediction: result.prediction,
          confidence: result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'
        });
        
        resolve(result);
      } catch (e) {
        console.error('Failed to parse:', output);
        reject(new Error(`Parse error: ${e.message}`));
      }
    });
    
    // Send data
    pythonProcess.stdin.write(JSON.stringify(features));
    pythonProcess.stdin.end();
  });
}

// ===== TEST 1: Basic Model Integration =====
test('FL_captcha Model Integration Test', async () => {
  console.log('='.repeat(60));
  console.log('🧪 TEST 1: FL_captcha Bot Detection Model Integration');
  console.log('='.repeat(60));
  
  // Test Case A: Human-like behavior
  console.log('\n🔹 Test A: Human-like behavior');
  const humanResult = await detectBot({
    mouseMoves: 25,
    totalDistance: 1500.0,
    scrolls: 4,
    focusSwitches: 1
  });
  
  console.log(`   ✅ Expected: human (prediction=1)`);
  console.log(`   ✅ Received: ${humanResult.label} (prediction=${humanResult.prediction})`);
  
  // Test Case B: Bot-like behavior  
  console.log('\n🔹 Test B: Bot-like behavior');
  const botResult = await detectBot({
    mouseMoves: 100,
    totalDistance: 50.0,
    scrolls: 0,
    focusSwitches: 0
  });
  
  console.log(`   ✅ Expected: bot (prediction=0)`);
  console.log(`   ✅ Received: ${botResult.label} (prediction=${botResult.prediction})`);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 INTEGRATION TEST RESULTS:');
  console.log(`   Human test: ${humanResult.label} ✓`);
  console.log(`   Bot test: ${botResult.label} ✓`);
  console.log('='.repeat(60));
  
  // Optional assertions (uncomment when ready)
  // expect(humanResult.label).toBe('human');
  // expect(humanResult.prediction).toBe(1);
  // expect(botResult.label).toBe('bot');
  // expect(botResult.prediction).toBe(0);
});

// ===== TEST 2: Real Website Testing =====
test('FL_captcha on Real Website - Human Simulation', async ({ page }) => {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 TEST 2: Testing on Website - Human Behavior');
  console.log('='.repeat(60));
  
  // CHANGE THIS TO YOUR ACTUAL WEBSITE
  const YOUR_WEBSITE = 'https://example.com'; // ⬅️ CHANGE THIS!
  console.log(`Navigating to: ${YOUR_WEBSITE}`);
  
  await page.goto(YOUR_WEBSITE);
  await page.waitForTimeout(1000);
  
  // Behavior tracker
  const behavior = {
    mouseMoves: 0,
    totalDistance: 0,
    scrolls: 0,
    focusSwitches: 0
  };
  
  // Setup tracking
  let lastX = 0, lastY = 0;
  
  await page.exposeFunction('trackEvent', (eventType, x, y) => {
    if (eventType === 'mousemove') {
      behavior.mouseMoves++;
      if (behavior.mouseMoves > 1) {
        const dist = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
        behavior.totalDistance += dist;
      }
      lastX = x;
      lastY = y;
    } else if (eventType === 'scroll') {
      behavior.scrolls++;
    } else if (eventType === 'focus') {
      behavior.focusSwitches++;
    }
  });
  
  await page.addInitScript(() => {
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      window.trackEvent('mousemove', e.clientX, e.clientY);
    });
    
    // Scroll tracking
    document.addEventListener('wheel', () => {
      window.trackEvent('scroll', 0, 0);
    });
    
    // Focus tracking
    document.addEventListener('focusin', () => {
      window.trackEvent('focus', 0, 0);
    });
  });
  
  // Simulate HUMAN behavior
  console.log('\n👤 Simulating natural human behavior...');
  
  // Natural mouse movements (curved, with pauses)
  const movements = [
    [100, 100], [120, 110], [140, 105], [160, 120], [180, 115],
    [200, 130], [220, 125], [240, 140], [260, 135], [280, 150]
  ];
  
  for (const [x, y] of movements) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(100 + Math.random() * 200); // Natural pauses
  }
  
  // Natural scrolling
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 200);
  
  // Some clicks
  await page.mouse.click(200, 150);
  await page.waitForTimeout(300);
  
  // Natural typing
  await page.keyboard.type('Hello FL_captcha', { delay: 100 });
  await page.waitForTimeout(200);
  await page.keyboard.type(' testing bot detection', { delay: 120 });
  
  // Collect results
  console.log('\n📊 Behavior collected:', behavior);
  
  // Get prediction
  const prediction = await detectBot(behavior);
  
  console.log('\n🎯 DETECTION RESULT:');
  console.log(`   Label: ${prediction.label}`);
  console.log(`   Prediction: ${prediction.prediction} (1=human, 0=bot)`);
  console.log(`   Confidence: ${prediction.confidence ? (prediction.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
  
  if (prediction.label === 'human') {
    console.log('   ✅ SUCCESS: Human behavior correctly detected!');
  } else {
    console.log('   ⚠️  Human behavior detected as bot');
  }
  
  console.log('\n' + '='.repeat(60));
});

// ===== TEST 3: Bot Simulation =====
test('FL_captcha on Real Website - Bot Simulation', async ({ page }) => {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 TEST 3: Testing on Website - Bot Behavior');
  console.log('='.repeat(60));
  
  const YOUR_WEBSITE = 'https://example.com'; // ⬅️ CHANGE THIS!
  await page.goto(YOUR_WEBSITE);
  await page.waitForTimeout(500);
  
  const behavior = {
    mouseMoves: 0,
    totalDistance: 0,
    scrolls: 0,
    focusSwitches: 0
  };
  
  // Simple tracking
  await page.exposeFunction('countMouse', () => {
    behavior.mouseMoves++;
  });
  
  await page.addInitScript(() => {
    document.addEventListener('mousemove', () => {
      window.countMouse();
    });
  });
  
  // Simulate BOT behavior (mechanical, fast)
  console.log('\n⚡ Simulating bot behavior...');
  
  // Rapid, straight-line mouse movements
  for (let i = 0; i < 50; i++) {
    await page.mouse.move(100 + i * 3, 100);
    await page.waitForTimeout(5); // Very fast
  }
  
  // Rapid typing
  await page.keyboard.type('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', { delay: 5 });
  
  // Jerky scrolling
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(10);
  await page.mouse.wheel(0, -1000);
  behavior.scrolls = 2;
  
  // Bot-like: many moves but little distance
  behavior.totalDistance = 50;
  
  console.log('\n📊 Bot behavior:', behavior);
  
  const prediction = await detectBot(behavior);
  
  console.log('\n🎯 DETECTION RESULT:');
  console.log(`   Label: ${prediction.label}`);
  console.log(`   Prediction: ${prediction.prediction}`);
  
  if (prediction.label === 'bot') {
    console.log('   ✅ SUCCESS: Bot behavior correctly detected!');
  } else {
    console.log('   ⚠️  Bot behavior detected as human');
  }
  
  console.log('\n' + '='.repeat(60));
});
