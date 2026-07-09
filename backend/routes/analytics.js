const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.db');
const db = new sqlite3.Database(dbPath);

// Simple overview endpoint
router.get('/overview', (req, res) => {
    res.json({
        success: true,
        overview: {
            totalUsers: 0,
            totalAttempts: 0,
            message: 'Analytics working'
        },
        timestamp: new Date().toISOString()
    });
});

// Other endpoints can be simplified too
router.get('/hourly', (req, res) => {
    res.json({
        success: true,
        hourly: [],
        message: 'Hourly data'
    });
});

module.exports = router;
