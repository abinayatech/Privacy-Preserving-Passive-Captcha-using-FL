// test_bots.js - Simple bot test
const fetch = require('node-fetch');

async function testBots() {
    console.log('🤖 Testing Bot Detection...');
    
    const testData = {
        session_id: "test-bot-" + Date.now(),
        timestamp: new Date().toISOString(),
        mouseMoves: 0,
        totalDistance: 0,
        avgKeyInterval: 0,
        scrolls: 0,
        focusSwitches: 0,
        keyTimes: [],
        label: "bot"
    };

    try {
        const response = await fetch('http://localhost:5003/api/tracking/s ave', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testBots();