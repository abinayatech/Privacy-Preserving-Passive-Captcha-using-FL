const fs = require('fs');
const axios = require('axios');

const JSON_FILE = 'dataset.json';
const BACKEND_URL = 'http://localhost:5002/save'; // your backend endpoint

// Read dataset.json
const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

// Function to send one record
async function sendRecord(record) {
  try {
    const response = await axios.post(BACKEND_URL, record);
    console.log('Sent:', record.session_id, 'Response:', response.data);
  } catch (err) {
    console.error('Error sending', record.session_id, err.message);
  }
}

// Send all records sequentially
(async () => {
  for (const record of data) {
    await sendRecord(record);
  }
  console.log('All records sent!');
})();
