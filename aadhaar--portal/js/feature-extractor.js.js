// feature-extractor.js
class FeatureExtractor {
    extractAdvancedFeatures(rawFeatures, sessionData) {
        return {
            // Basic features
            ...rawFeatures,
            
            // Derived features for ML
            mouseVelocity: rawFeatures.totalDistance / Math.max(rawFeatures.mouseMoves, 1),
            interactionDensity: (rawFeatures.mouseMoves + rawFeatures.scrolls) / (sessionData.sessionDuration || 1),
            keyConsistency: this.calculateKeyConsistency(rawFeatures.keyTimes),
            focusPattern: rawFeatures.focusSwitches > 2 ? 1 : 0,
            
            // Behavioral patterns
            hasMouseMovement: rawFeatures.mouseMoves > 0 ? 1 : 0,
            hasScrolling: rawFeatures.scrolls > 0 ? 1 : 0,
            hasKeyboard: rawFeatures.avgKeyInterval > 0 ? 1 : 0
        };
    }
    
    calculateKeyConsistency(keyTimes) {
        if (keyTimes.length < 3) return 0;
        const intervals = [];
        for (let i = 1; i < keyTimes.length; i++) {
            intervals.push(keyTimes[i] - keyTimes[i-1]);
        }
        
        // Calculate coefficient of variation
        const mean = intervals.reduce((a, b) => a + b) / intervals.length;
        const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
        return Math.sqrt(variance) / mean;
    }
}

module.exports = new FeatureExtractor();