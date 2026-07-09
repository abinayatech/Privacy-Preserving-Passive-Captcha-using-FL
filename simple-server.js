// SIMPLE SERVER
const express = require("express");
const path = require("path");
const app = express();
const PORT = 5003;

app.use(express.static("aadhaar--portal"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "index.html"));
});

app.get("/verify", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "verify.html"));
});

app.listen(PORT, () => {
    console.log("✅ Server: http://localhost:" + PORT);
});
