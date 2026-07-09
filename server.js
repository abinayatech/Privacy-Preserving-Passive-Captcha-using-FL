const express = require("express");
const path = require("path");
const app = express();
const PORT = 5003;

// ✅ Correct path to serve frontend files
app.use(express.static(path.join(__dirname, "aadhaar--portal")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "aadhaar--portal", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend running at http://localhost:${PORT}`);
});
