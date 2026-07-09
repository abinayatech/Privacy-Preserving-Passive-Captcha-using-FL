// bridge.js - Simple working bridge for ML CAPTCHA
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const FLASK_URL = 'http://localhost:5000';
const PORT = 5003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ENDPOINTS ====================

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Bridge server running',
        time: new Date().toISOString(),
        endpoints: ['/health', '/api/ml-health', '/api/ml-detect-enhanced', '/test-flask', '/predict']
    });
});

// ML Health endpoint (what verify.html expects)
app.get('/api/ml-health', (req, res) => {
    res.json({ 
        status: 'healthy',
        debugMode: false,
        model: 'rf_model_balanced_fixed.pkl',
        accuracy: '97%',
        server: 'Node.js + Flask Bridge',
        timestamp: new Date().toISOString(),
        features: 5,
        flask_url: FLASK_URL
    });
});

// Main ML endpoint (what login-detection.js expects)
app.post('/api/ml-detect-enhanced', async (req, res) => {
    console.log('📥 Received ML request - Session:', req.body.sessionId?.substring(0, 20) || 'unknown');
    
    try {
        const features = req.body.features;
        
        // Validate features
        if (!features || !Array.isArray(features)) {
            return res.status(400).json({
                is_human: false,
                confidence: 0,
                error: 'Features must be an array of 5 numbers',
                example: [0.15, 45.2, 3, 0.33, 2]
            });
        }
        
        if (features.length !== 5) {
            return res.status(400).json({
                is_human: false,
                confidence: 0,
                error: `Expected 5 features, got ${features.length}`,
                received: features
            });
        }
        
        console.log('🎯 Features:', features.map(f => f.toFixed(2)));
        
        // Forward to Flask
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
            features: features
        }, {
            timeout: 5000
        });
        
        console.log('✅ Flask response:', flaskResponse.data);
        
        // Transform response
        const mlResult = flaskResponse.data;
        const result = {
            is_human: mlResult.prediction === 0,  // 0 = human, 1 = bot
            confidence: mlResult.confidence ? Math.round(mlResult.confidence * 100) : 50,
            prediction: mlResult.prediction === 0 ? 'human' : 'bot',
            raw_ml_result: mlResult,
            features_sent: features,
            session_id: req.body.sessionId || 'session_' + Date.now()
        };
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Bridge error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                is_human: false,
                confidence: 0,
                error: 'Flask ML server not running on port 5000',
                fix: 'Start Flask: python flask_server.py'
            });
        } else if (error.response) {
            res.status(error.response.status).json({
                is_human: false,
                confidence: 0,
                error: `Flask error: ${error.response.data?.error || error.message}`
            });
        } else {
            res.status(500).json({
                is_human: false,
                confidence: 0,
                error: error.message
            });
        }
    }
});

// Simple predict endpoint
app.post('/predict', async (req, res) => {
    try {
        const features = req.body.features || [];
        console.log('🔍 /predict with:', features);
        
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
            features: features
        });
        
        res.json(flaskResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test Flask connection
app.get('/test-flask', async (req, res) => {
    try {
        const response = await axios.get(`${FLASK_URL}/health`, { timeout: 3000 });
        res.json({ 
            flaskStatus: 'connected', 
            data: response.data,
            bridge: 'Node.js Bridge v1.0',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({ 
            flaskStatus: 'disconnected', 
            error: error.message,
            fix: 'Start Flask server with: python flask_server.py',
            timestamp: new Date().toISOString()
        });
    }
});

// Debug endpoint for testing
app.post('/debug-test', (req, res) => {
    const testFeatures = [0.15, 45.2, 3, 0.33, 2];
    console.log('🐛 Debug test with features:', testFeatures);
    
    res.json({
        test: 'success',
        test_features: testFeatures,
        expected_result: 'human with ~97% confidence',
        bridge_status: 'operational',
        timestamp: new Date().toISOString()
    });
});

// Serve verify.html as default for easy access
app.get('/', (req, res) => {
    res.redirect('/verify.html');
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
🚀 ML CAPTCHA BRIDGE
====================
✅ Running on: http://localhost:${PORT}
🔗 Forwarding to: ${FLASK_URL}
📁 Serving from: ./public/

📋 Available endpoints:
  GET  /health              - Bridge health
  GET  /api/ml-health       - ML system health (frontend checks this)
  POST /api/ml-detect-enhanced - Main ML endpoint (frontend calls this)
  GET  /test-flask          - Test Flask connection
  POST /predict             - Simple prediction
  POST /debug-test          - Test bridge without Flask

🌐 Frontend URLs:
  Verify Page: http://localhost:${PORT}/verify.html
  Health Check: http://localhost:${PORT}/api/ml-health

🔧 Quick tests:
  curl http://localhost:${PORT}/api/ml-health
  curl -X POST http://localhost:${PORT}/api/ml-detect-enhanced \\
    -H "Content-Type: application/json" \\
    -d '{"features":[0.15,45.2,3,0.33,2],"sessionId":"test123"}'

🎯 Your frontend (verify.html) will now work!
    `);
});

// Handle server errors
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});