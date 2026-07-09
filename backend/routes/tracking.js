const express = require('express');
const router = express.Router();
const botDetector = require('../lightweight-ml');
const { BehaviorModel } = require('../database/models');

// POST /save route with progressive CAPTCHA
router.post('/save', async (req, res) => {
    try {
        const { session_id, timestamp, ...rawFeatures } = req.body;
        
        console.log('📊 Received behavior data:', {
            session_id,
            mouseMoves: rawFeatures.mouseMoves,
            scrolls: rawFeatures.scrolls,
            keyStrokes: rawFeatures.keyTimes?.length || 0
        });

        // ML-based bot detection
        const detectionResult = await botDetector.predict(rawFeatures);
        
        // Calculate confidence levels
        const botConfidence = detectionResult.confidence;
        const humanConfidence = 1 - botConfidence;
        
        // Progressive CAPTCHA logic
        let action, message, showCaptcha, requireCaptcha;
        
        if (detectionResult.isBot && botConfidence >= 0.85) {
            // HIGH CONFIDENCE BOT (85-100%) → Block immediately
            action = 'block';
            message = '❌ Automated behavior detected. Access denied.';
            showCaptcha = false;
            requireCaptcha = false;
            
            // Log bot attempt
            const botData = {
                session_id: session_id,
                mouse_moves: rawFeatures.mouseMoves,
                total_distance: rawFeatures.totalDistance,
                avg_key_interval: rawFeatures.avgKeyInterval,
                scrolls: rawFeatures.scrolls,
                focus_switches: rawFeatures.focusSwitches,
                label: 'bot',
                detection_confidence: botConfidence,
                bot_score: botConfidence,
                page_visited: 'aadhaar_form',
                duration_seconds: 30
            };
            
            await BehaviorModel.saveTracking(botData);
            
            return res.status(403).json({
                success: false,
                action: action,
                message: message,
                showCaptcha: showCaptcha,
                requireCaptcha: requireCaptcha,
                detection: {
                    isBot: true,
                    confidence: botConfidence,
                    humanConfidence: humanConfidence,
                    verdict: 'BOT (High Confidence)',
                    mlBased: detectionResult.mlBased || false
                },
                popup: {
                    message: message,
                    type: 'error',
                    autoClose: 5000
                }
            });
            
        } else if (!detectionResult.isBot && humanConfidence >= 0.85) {
            // HIGH CONFIDENCE HUMAN (85-100%) → Allow immediately
            action = 'allow';
            message = '✅ Human verification successful!';
            showCaptcha = false;
            requireCaptcha = false;
            
        } else {
            // UNCERTAIN (50-84% confidence) → Show CAPTCHA
            action = 'verify';
            message = '⚠️ Additional verification required';
            showCaptcha = true;
            requireCaptcha = true;
        }

        // Save to database (for humans and uncertain cases)
        const userData = {
            session_id: session_id,
            mouse_moves: rawFeatures.mouseMoves,
            total_distance: rawFeatures.totalDistance,
            avg_key_interval: rawFeatures.avgKeyInterval,
            scrolls: rawFeatures.scrolls,
            focus_switches: rawFeatures.focusSwitches,
            label: detectionResult.isBot ? 'bot' : 'human',
            detection_confidence: detectionResult.isBot ? botConfidence : humanConfidence,
            bot_score: botConfidence,
            page_visited: 'aadhaar_form',
            duration_seconds: 60,
            captcha_required: requireCaptcha,
            verification_status: action
        };

        const dbResult = await BehaviorModel.saveTracking(userData);
        
        console.log(`✅ Data saved - Action: ${action}, Confidence: ${detectionResult.isBot ? botConfidence : humanConfidence}`);
        
        // Return response
        res.json({
            success: true,
            action: action,
            message: message,
            showCaptcha: showCaptcha,
            requireCaptcha: requireCaptcha,
            database_id: dbResult.id,
            detection: {
                isBot: detectionResult.isBot,
                confidence: detectionResult.isBot ? botConfidence : humanConfidence,
                humanConfidence: humanConfidence,
                botConfidence: botConfidence,
                verdict: detectionResult.isBot ? 
                    `Suspicious (${(botConfidence*100).toFixed(1)}% bot)` : 
                    `Likely Human (${(humanConfidence*100).toFixed(1)}% confidence)`,
                mlBased: detectionResult.mlBased || false,
                details: detectionResult.details || {}
            },
            popup: {
                message: message,
                type: action === 'allow' ? 'success' : 'warning',
                autoClose: action === 'allow' ? 3000 : 4000
            }
        });
        
    } catch (error) {
        console.error('❌ Error in /save route:', error);
        res.status(500).json({ 
            error: error.message,
            popup: {
                message: '❌ System error. Please try again.',
                type: 'error',
                autoClose: 5000
            }
        });
    }
});

module.exports = router;