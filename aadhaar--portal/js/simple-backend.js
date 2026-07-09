const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const FLASK_URL = 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ENDPOINTS ====================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend bridge is running',
        time: new Date().toISOString(),
        endpoints: ['/health', '/predict', '/test-flask', '/api/ml-health', '/api/ml-detect-enhanced']
    });
});

// Your frontend expects this endpoint (from verify.html)
app.get('/api/ml-health', (req, res) => {
    res.json({ 
        status: 'healthy',
        ml_model: 'rf_model_balanced_fixed.pkl',
        accuracy: '97%',
        debugMode: true,
        server: 'Node.js + Flask ML Bridge',
        flask_url: FLASK_URL,
        endpoints: {
            predict: '/predict',
            ml_detect: '/api/ml-detect-enhanced',
            health: '/api/ml-health'
        }
    });
});

// Main prediction endpoint (simple version)
app.post('/predict', async (req, res) => {
    try {
        const features = req.body.features;
        console.log('📥 /predict received features:', features);
        
        // Validate features
        if (!features || !Array.isArray(features) || features.length !== 5) {
            console.error('❌ Invalid features format:', features);
            return res.status(400).json({ 
                error: 'Invalid features format. Expected array of 5 numbers.',
                received: features,
                example: [0.15, 45.2, 3, 0.33, 2]
            });
        }
        
        // Check for all zeros
        if (features.every(f => f === 0)) {
            console.warn('⚠️ All features are zero!');
            return res.status(400).json({
                error: 'All features are zero. Move your mouse and interact with the page.',
                help: 'Make sure mouse tracking is working in login-detection.js'
            });
        }
        
        console.log('📤 Forwarding to Flask server...');
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
            features: features
        }, {
            timeout: 5000
        });
        
        console.log('✅ Flask response:', flaskResponse.data);
        res.json(flaskResponse.data);
        
    } catch (error) {
        console.error('❌ Error forwarding to Flask:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: 'Flask ML server is not running on port 5000',
                fix: 'Run: python flask_server.py',
                prediction: null,
                confidence: null
            });
        } else if (error.response) {
            // Flask returned an error
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ 
                error: error.message,
                prediction: null,
                confidence: null
            });
        }
    }
});

// Your frontend's login-detection.js calls this endpoint
app.post('/api/ml-detect-enhanced', async (req, res) => {
    try {
        const { features, sessionId, timestamp, mouseMoves, totalDistance } = req.body;
        console.log('🔍 /api/ml-detect-enhanced received:');
        console.log('   Features:', features);
        console.log('   Session:', sessionId);
        console.log('   Mouse moves:', mouseMoves);
        
        // Validate
        if (!features || !Array.isArray(features) || features.length !== 5) {
            return res.status(400).json({ 
                is_human: false,
                confidence: 0,
                error: 'Invalid features',
                received: features
            });
        }
        
        // Forward to Flask
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
            features: features
        }, {
            timeout: 5000
        });
        
        const mlResult = flaskResponse.data;
        console.log('✅ ML Prediction:', mlResult);
        
        // Transform to frontend format
        const result = {
            is_human: mlResult.prediction === 0,  // 0 = human, 1 = bot
            confidence: mlResult.confidence ? Math.round(mlResult.confidence * 100) : 50,
            prediction: mlResult.prediction === 0 ? 'human' : 'bot',
            ml_raw: mlResult,
            features_sent: features,
            session_id: sessionId || 'unknown'
        };
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Error in ml-detect-enhanced:', error.message);
        
        res.status(500).json({
            is_human: false,
            confidence: 0,
            error: error.message,
            fix: 'Check if Flask server is running: python flask_server.py'
        });
    }
});

// Test endpoint to verify Flask connection
app.get('/test-flask', async (req, res) => {
    try {
        const response = await axios.get(`${FLASK_URL}/health`);
        res.json({ 
            flaskStatus: 'connected', 
            data: response.data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({ 
            flaskStatus: 'disconnected', 
            error: error.message,
            fix: 'Start Flask server with: python flask_server.py'
        });
    }
});

// Debug endpoint to test features manually
app.post('/debug-predict', async (req, res) => {
    try {
        const features = req.body.features || [0.15, 45.2, 3, 0.33, 2];
        const testName = req.body.test_name || 'default';
        
        console.log(`🐛 Debug test "${testName}" with features:`, features);
        
        const flaskResponse = await axios.post(`${FLASK_URL}/predict`, {
            features: features
        });
        
        res.json({
            test_name: testName,
            test_features: features,
            ml_result: flaskResponse.data,
            interpretation: flaskResponse.data.prediction === 0 ? 'HUMAN' : 'BOT',
            confidence_percent: Math.round((flaskResponse.data.confidence || 0) * 100) + '%',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.json({ 
            error: error.message,
            test_name: req.body.test_name || 'default'
        });
    }
});

// ==================== START SERVER ====================

const PORT = 5003;
app.listen(PORT, () => {
    console.log(`
🚀 ML CAPTCHA Backend Bridge
================================
✅ Server running on: http://localhost:${PORT}
🔗 Forwarding to Flask: ${FLASK_URL}
📁 Serving frontend from: ./public/
================================

📋 Available endpoints:
  GET  /health              - Check backend health
  GET  /api/ml-health       - ML system health (frontend expects this)
  GET  /test-flask          - Test Flask connection
  POST /predict             - Simple prediction endpoint
  POST /api/ml-detect-enhanced - Enhanced ML detection (frontend calls this)
  POST /debug-predict       - Test with custom features

🌐 Frontend URLs:
  Homepage: http://localhost:${PORT}/index.html
  Verify Page: http://localhost:${PORT}/verify.html
  Test ML: http://localhost:${PORT}/verify.html#test

🔧 Quick tests:
  curl http://localhost:${PORT}/api/ml-health
  curl -X POST http://localhost:${PORT}/debug-predict
    `);
});