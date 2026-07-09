// test-model.js - Testing ML Model
console.log("🔍 Starting ML Model Test\n");

try {
  console.log("Step 1: Loading ML detector...");
  const detector = require("./backend/lightweight-ml");
  console.log("✅ ML detector loaded!\n");
  
  async function runTest() {
    // Test obvious bot
    console.log("🤖 Testing obvious bot...");
    const botResult = await detector.predict({
      mouseMoves: 0,
      scrolls: 0,
      avgKeyInterval: 10,
      focusSwitches: 0,
      session_id: "test-bot"
    });
    
    console.log(`   Bot result: ${botResult.isBot ? "🚨 BOT" : "👤 HUMAN"}`);
    console.log(`   Confidence: ${(botResult.confidence * 100).toFixed(1)}%\n`);
    
    // Test obvious human
    console.log("👤 Testing obvious human...");
    const humanResult = await detector.predict({
      mouseMoves: 25,
      scrolls: 4,
      avgKeyInterval: 235,
      focusSwitches: 2,
      session_id: "test-human"
    });
    
    console.log(`   Human result: ${humanResult.isBot ? "🚨 BOT" : "👤 HUMAN"}`);
    console.log(`   Confidence: ${(humanResult.confidence * 100).toFixed(1)}%\n`);
    
    // Calculate accuracy
    const botCorrect = botResult.isBot === true;
    const humanCorrect = humanResult.isBot === false;
    const accuracy = ((botCorrect + humanCorrect) / 2) * 100;
    
    console.log("📊 RESULTS:");
    console.log("============");
    console.log(`Bot detection: ${botCorrect ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Human allowance: ${humanCorrect ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`Overall accuracy: ${accuracy}%`);
    
    if (accuracy === 100) {
      console.log("\n🎉 READY FOR FL!");
    } else {
      console.log("\n⚠️  FIX ML FIRST!");
    }
  }
  
  runTest().catch(err => console.log("Test error:", err));
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}
