// Test the ML integration
const botDetector = require('./lightweight-ml');

async function testIntegration() {
    console.log('=== TESTING ML INTEGRATION ===\n');
    
    // Test 1: Obvious bot (should be detected by ML)
    console.log('1. Testing OBVIOUS BOT (no mouse movement, fast typing):');
    const botFeatures = {
        session_id: 'test-bot-001',
        mouseMoves: 0,
        totalDistance: 0,
        avgKeyInterval: 15,  // Very fast (bot-like)
        scrolls: 0,
        focusSwitches: 0,
        keyTimes: [100, 115, 130, 145]  // Consistent 15ms intervals
    };
    
    const botResult = await botDetector.predict(botFeatures);
    console.log('Result:', JSON.stringify(botResult, null, 2));
    console.log(`✅ ${botResult.isBot ? 'BOT DETECTED' : 'HUMAN'} (ML: ${botResult.mlBased ? 'YES' : 'NO'})\n`);
    
    // Test 2: Human-like behavior
    console.log('2. Testing HUMAN-LIKE behavior:');
    const humanFeatures = {
        session_id: 'test-human-001',
        mouseMoves: 28,
        totalDistance: 425.7,
        avgKeyInterval: 235.4,  // Normal human speed
        scrolls: 4,
        focusSwitches: 2,
        keyTimes: [100, 350, 600, 850]  // Variable intervals
    };
    
    const humanResult = await botDetector.predict(humanFeatures);
    console.log('Result:', JSON.stringify(humanResult, null, 2));
    console.log(`✅ ${humanResult.isBot ? 'BOT DETECTED' : 'HUMAN'} (ML: ${humanResult.mlBased ? 'YES' : 'NO'})\n`);
    
    // Test 3: Edge case (minimal activity)
    console.log('3. Testing EDGE CASE (minimal activity):');
    const edgeFeatures = {
        session_id: 'test-edge-001',
        mouseMoves: 1,
        totalDistance: 5.2,
        avgKeyInterval: 0,
        scrolls: 0,
        focusSwitches: 0
    };
    
    const edgeResult = await botDetector.predict(edgeFeatures);
    console.log('Result:', JSON.stringify(edgeResult, null, 2));
    console.log(`✅ ${edgeResult.isBot ? 'BOT DETECTED' : 'HUMAN'} (ML: ${edgeResult.mlBased ? 'YES' : 'NO'})\n`);
    
    // Summary
    console.log('=== INTEGRATION SUMMARY ===');
    console.log(`Total tests: 3`);
    console.log(`ML-based predictions: ${[botResult, humanResult, edgeResult].filter(r => r.mlBased).length}`);
    console.log(`Fallback predictions: ${[botResult, humanResult, edgeResult].filter(r => r.fallback).length}`);
    console.log(`Bots detected: ${[botResult, humanResult, edgeResult].filter(r => r.isBot).length}`);
}

// Run test
testIntegration().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});