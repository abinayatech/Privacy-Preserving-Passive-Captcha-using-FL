const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'dataset.csv');
const JSON_FILE = path.join(__dirname, 'dataset.json');

// Read CSV
const csvData = fs.readFileSync(CSV_FILE, 'utf-8').trim().split('\n');

// Extract header
const headers = csvData[0].split(',');

// Convert each row to JSON object
const jsonArray = csvData.slice(1).map(row => {
  const values = row.split(',');
  const obj = {};
  headers.forEach((header, index) => {
    // Convert numeric values
    if(!isNaN(values[index]) && values[index] !== '') obj[header] = parseFloat(values[index]);
    else obj[header] = values[index];
  });
  return obj;
});

// Save to JSON file
fs.writeFileSync(JSON_FILE, JSON.stringify(jsonArray, null, 2));

console.log('CSV converted to JSON:', JSON_FILE);
