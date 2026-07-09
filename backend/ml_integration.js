const { spawn } = require('child_process');
const path = require('path');

class MLIntegration {
    constructor() {
        console.log('ML Integration initialized');
    }
    
    async predict(features) {
        console.log('Predicting for session:', features.session_id || 'unknown');
        
        try {
            const result = await this.callPythonML(features);
            console.log('ML Result:', result.label, 'confidence:', result.confidence);
            return result;
        } catch (error) {
            console.error('ML failed, using fallback:', error.message);
            return this.fallbackDetection(features);
        }
    }
    
    async callPythonML(features) {
        return new Promise((resolve, reject) => {
            console.log('Calling Python ML model...');
            
            // Prepare features
            const pythonFeatures = {
                mouseMoves: features.mouseMoves || 0,
                totalDistance: features.totalDistance || 0,
                scrolls: features.scrolls || 0,
                focusSwitches: features.focusSwitches || 0,
                avgKeyInterval: features.avgKeyInterval || 0
            };
            
            const featuresJson = JSON.stringify(pythonFeatures);
            console.log('Sending to Python:', featuresJson);
            
            // Call Python
            const pythonProcess = spawn('python', [path.join(__dirname, 'ml_simple.py')]);
            
            let stdout = '';
            let stderr = '';
            
            pythonProcess.stdin.write(featuresJson);
            pythonProcess.stdin.end();
            
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
                console.error('Python stderr:', data.toString().trim());
            });
            
            pythonProcess.on('close', (code) => {
                if (code === 0 && stdout) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve({
                            isBot: result.label === 'bot',
                            confidence: result.confidence,
                            mlBased: true,
                            details: result
                        });
                    } catch (e) {
                        reject(new Error('Failed to parse Python output: ' + e.message));
                    }
                } else {
                    reject(new Error('Python failed: ' + stderr));
                }
            });
        });
    }
    
    fallbackDetection(features) {
        console.log('Using fallback detection');
        
        let score = 0;
        if ((features.mouseMoves || 0) < 3) score += 0.3;
        if ((features.totalDistance || 0) < 50) score += 0.2;
        if ((features.avgKeyInterval || 0) > 0 && (features.avgKeyInterval || 0) < 50) score += 0.2;
        if ((features.scrolls || 0) === 0) score += 0.1;
        if ((features.focusSwitches || 0) === 0) score += 0.1;
        
        return {
            isBot: score > 0.5,
            confidence: score,
            mlBased: false,
            fallback: true
        };
    }
}

module.exports = new MLIntegration();