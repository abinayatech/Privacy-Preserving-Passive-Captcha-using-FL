const axios = require('axios');

const NUM_BOTS = parseInt(process.argv[2]) || 10;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBotPayload(index) {
  return {
    session_id: "sess-bot-" + index,
    timestamp: new Date().toISOString(),
    mouseMoves: randomInt(0, 200),
    totalDistance: parseFloat((Math.random() * 1500).toFixed(2)),
    avgKeyInterval: parseFloat((Math.random() * 500).toFixed(2)),
    scrolls: randomInt(0, 10),
    focusSwitches: randomInt(0, 5),
    label: "bot"
  };
}

async function sendBots(num) {
  for (let i = 0; i < num; i++) {
    const payload = generateBotPayload(i);
    try {
      await axios.post('http://localhost:5002/save', payload);
      console.log(`✅ Bot ${i + 1} saved:`, payload.session_id);
    } catch (err) {
      console.error(`❌ Failed to save bot ${i + 1}:`, err.message);
    }
  }
}

sendBots(NUM_BOTS);
