// ml-detection.js
const tf = require('@tensorflow/tfjs-node');

class BotDetectionModel {
    constructor() {
        this.model = null;
        this.featureNames = ['mouseMoves', 'totalDistance', 'avgKeyInterval', 'scrolls', 'focusSwitches'];
    }
    
    // Simple rule-based + ML hybrid model
    async predict(features) {
        // Rule-based detection (existing logic)
        const isBotBasic = this.ruleBasedDetection(features);
        
        // ML-based detection
        const mlScore = await this.mlDetection(features);
        
        // Combine results
        return {
            isBot: isBotBasic || mlScore > 0.7,
            confidence: mlScore,
            ruleBased: isBotBasic,
            mlBased: mlScore > 0.7
        };
    }
    
    ruleBasedDetection(features) {
        return (
            features.mouseMoves === 0 && 
            features.scrolls === 0 && 
            features.avgKeyInterval === 0 && 
            features.focusSwitches === 0
        );
    }
    
    async mlDetection(features) {
        // Simple heuristic-based ML (immediate implementation)
        let score = 0;
        
        // Mouse movement analysis
        if (features.mouseMoves < 3) score += 0.3;
        if (features.totalDistance < 50) score += 0.2;
        
        // Keyboard pattern analysis
        if (features.avgKeyInterval > 0 && features.avgKeyInterval < 50) score += 0.2; // Too fast
        if (features.avgKeyInterval > 1000) score += 0.1; // Too slow
        
        // Scroll behavior
        if (features.scrolls > 10 && features.mouseMoves === 0) score += 0.2;
        
        return Math.min(score, 1.0);
    }
}

module.exports = new BotDetectionModel();