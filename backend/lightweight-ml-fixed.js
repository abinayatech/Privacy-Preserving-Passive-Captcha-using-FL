const { spawn } = require('child_process');
const path = require('path');

class FixedMLDetector {
    constructor() {
        console.log('[FIXED] ML Detector initialized');
    }
    
    async predict(features) {
        console.log([FIXED] Predicting for: );
        
        try {
            // Call Python ML model
            const mlResult = await this.callPythonMLFixed(features);
            
            console.log([FIXED] ML Prediction:  ());
            
            return mlResult;
            
        } catch (error) {
            console.error('[FIXED] ML failed:', error.message);
            return this.ruleBasedFallback(features);
        }
    }
    
    async callPythonMLFixed(features) {
        return new Promise((resolve, reject) => {
            console.log('[FIXED] Calling Python ML...');
            
            // Prepare features - only send what Python needs
            const pythonFeatures = {
                mouseMoves: features.mouseMoves || 0,
                totalDistance: features.totalDistance || 0,
                scrolls: features.scrolls || 0,
                focusSwitches: features.focusSwitches || 0,
                avgKeyInterval: features.avgKeyInterval || 0
            };
            
            const featuresJson = JSON.stringify(pythonFeatures);
            console.log('[FIXED] Sending to Python:', featuresJson);
            
            // Use the SIMPLE ml_working.py we know works
            const pythonProcess = spawn('python', [
                path.join(__dirname, 'ml_working.py')
            ]);
            
            let stdout = '';
            let stderr = '';
            
            pythonProcess.stdin.write(featuresJson);
            pythonProcess.stdin.end();
            
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
                console.log('[FIXED] Python output:', data.toString().trim());
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
                console.error('[FIXED] Python error:', data.toString().trim());
            });
            
            pythonProcess.on('close', (code) => {
                console.log([FIXED] Python exited with code: );
                
                if (code === 0 && stdout.trim()) {
                    try {
                        const result = JSON.parse(stdout);
                        
                        // Convert Python result to expected format
                        const mlResult = {
                            isBot: result.label === 'bot',
                            confidence: result.confidence,
                            mlBased: true,
                            details: result
                        };
                        
                        resolve(mlResult);
                    } catch (e) {
                        reject(new Error(\Parse error: \\));
                    }
                } else {
                    reject(new Error(\Python failed: \\));
                }
            });
            
            pythonProcess.on('error', (error) => {
                reject(new Error(\Failed to start Python: \\));
            });
            
            // Timeout
            setTimeout(() => {
                if (pythonProcess.exitCode === null) {
                    pythonProcess.kill();
                    reject(new Error('ML prediction timeout'));
                }
            }, 5000);
        });
    }
    
    ruleBasedFallback(features) {
        console.log('[FIXED] Using rule-based fallback');
        
        let score = 0;
        
        if ((features.mouseMoves || 0) < 3) score += 0.3;
        if ((features.totalDistance || 0) < 50) score += 0.2;
        if ((features.avgKeyInterval || 0) > 0 && (features.avgKeyInterval || 0) < 50) score += 0.2;
        if ((features.scrolls || 0) === 0) score += 0.1;
        if ((features.focusSwitches || 0) === 0) score += 0.1;
        
        const isBot = score > 0.5;
        const confidence = Math.min(Math.max(score, 0.1), 0.9);
        
        return {
            isBot: isBot,
            confidence: confidence,
            mlBased: false,
            fallback: true,
            warning: 'Using rule-based fallback'
        };
    }
}

// Create and export instance
const detector = new FixedMLDetector();
module.exports = detector;