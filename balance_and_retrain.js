const fs = require("fs");
const path = require("path");

console.log("🔍 Analyzing and fixing dataset...\n");

// Read dataset
const data = fs.readFileSync("dataset.csv", "utf8");
const lines = data.trim().split("\n").filter(line => line.trim() !== "");

let humans = [];
let bots = [];

lines.forEach(line => {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes("human")) {
    humans.push(line);
  } else if (lowerLine.includes("bot")) {
    bots.push(line);
  }
});

console.log("📊 Original dataset analysis:");
console.log(`   Total samples: ${lines.length}`);
console.log(`   Humans: ${humans.length}`);
console.log(`   Bots: ${bots.length}`);
console.log(`   Ratio: ${(bots.length/humans.length).toFixed(1)}:1 (bot:human)\n`);

// Create balanced dataset (1:1 ratio)
const minCount = Math.min(humans.length, bots.length);
console.log(`Creating balanced dataset with ${minCount} of each class...`);

const balancedHumans = humans.slice(0, minCount);
const balancedBots = bots.slice(0, minCount);

// Combine and shuffle
const balancedData = [...balancedHumans, ...balancedBots]
  .sort(() => Math.random() - 0.5)
  .join("\n");

// Save
fs.writeFileSync("dataset_balanced.csv", balancedData);

console.log("✅ Created balanced dataset: dataset_balanced.csv");
console.log(`   Humans: ${balancedHumans.length}`);
console.log(`   Bots: ${balancedBots.length}`);
console.log(`   Total: ${balancedHumans.length + balancedBots.length}`);
console.log(`   Ratio: 1:1 (perfectly balanced!)`);
