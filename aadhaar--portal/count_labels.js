const fs = require('fs');
const path = './dataset.csv';

// Initialize counters
let humanCount = 0;
let botCount = 0;

// Read the CSV file
fs.readFile(path, 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading dataset:", err);
    return;
  }

  // Split into lines
  const lines = data.trim().split('\n');

  // Ignore header if present
  const startIndex = lines[0].includes('label') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const label = cols[cols.length - 1].trim().toLowerCase();

    if (label === 'human') humanCount++;
    else if (label === 'bot') botCount++;
  }

  console.log(`✅ Dataset summary:`);
  console.log(`Humans: ${humanCount}`);
  console.log(`Bots: ${botCount}`);
  console.log(`Total entries: ${humanCount + botCount}`);
});
