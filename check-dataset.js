const fs = require("fs");

console.log("🔍 Analyzing dataset.csv...\n");

try {
  const data = fs.readFileSync("dataset.csv", "utf8");
  const lines = data.split("\n").filter(line => line.trim() !== "");
  
  // Check if there's a header
  const hasHeader = lines[0].toLowerCase().includes("mouse") || lines[0].toLowerCase().includes("label");
  const startIndex = hasHeader ? 1 : 0;
  
  const samples = lines.slice(startIndex);
  
  console.log(`📊 Dataset Summary:`);
  console.log(`   Total lines: ${lines.length}`);
  console.log(`   Has header: ${hasHeader ? "Yes" : "No"}`);
  console.log(`   Data samples: ${samples.length}\n`);
  
  let humans = 0;
  let bots = 0;
  let featureCounts = {};
  
  // Analyze each sample
  samples.forEach((line, index) => {
    const parts = line.split(",");
    
    // Count labels
    const lastColumn = parts[parts.length - 1].toLowerCase().trim();
    if (lastColumn.includes("human")) {
      humans++;
    } else if (lastColumn.includes("bot")) {
      bots++;
    }
    
    // Count features (for first 5 samples)
    if (index < 5) {
      featureCounts[`Sample ${index + 1}`] = parts.length;
    }
  });
  
  console.log(`🎯 Label Distribution:`);
  console.log(`   Humans: ${humans}`);
  console.log(`   Bots: ${bots}`);
  console.log(`   Ratio: ${bots > 0 ? (humans/bots).toFixed(2) : "N/A"}:1 (human:bot)`);
  console.log(`   Bot percentage: ${((bots/(humans+bots))*100).toFixed(1)}%\n`);
  
  console.log(`📈 First few samples feature count:`);
  Object.entries(featureCounts).forEach(([sample, count]) => {
    console.log(`   ${sample}: ${count} columns`);
  });
  
  // Check balance
  console.log(`\n⚖️  Dataset Balance Check:`);
  if (bots === 0 || humans === 0) {
    console.log("   ❌ PROBLEM: Missing one class!");
  } else if (Math.abs(humans - bots) > (humans + bots) * 0.3) {
    console.log("   ⚠️  WARNING: Imbalanced dataset (>30% difference)");
  } else {
    console.log("   ✅ Good: Balanced dataset");
  }
  
} catch (error) {
  console.log(`❌ Error reading dataset.csv: ${error.message}`);
  console.log(`\n📁 Current folder: ${process.cwd()}`);
  console.log(`   File exists: ${fs.existsSync("dataset.csv")}`);
}
