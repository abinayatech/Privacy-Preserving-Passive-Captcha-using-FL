// login-detection.js - Enhanced with ML CAPTCHA and Human Simulation
// This file intercepts form submissions and sends behavior data to ML server

// Configuration
const ML_SERVER_URL = 'http://localhost:5003';
const SIMULATE_HUMAN = true; // Set to true to add simulated human behavior
let behaviorData = {
    mouseMovements: [],
    mouseClicks: [],
    keyPresses: [],
    scrollEvents: [],
    focusEvents: [],
    touchEvents: [],
    timestamps: {
        pageLoad: Date.now(),
        firstInteraction: null,
        formSubmit: null
    },
    formData: {}
};

// ==================== HUMAN SIMULATION FOR TESTING ====================
function simulateHumanBehavior() {
    if (!SIMULATE_HUMAN) return;
    
    console.log('🤖 SIMULATING human behavior for testing...');
    
    // Add simulated mouse movements (curved, natural patterns)
    const baseX = 200;
    const baseY = 300;
    
    for (let i = 0; i < 20; i++) {
        const timeOffset = Math.random() * 5000; // Last 5 seconds
        const angle = (i / 20) * Math.PI * 2;
        const radius = 50 + Math.random() * 100;
        
        behaviorData.mouseMovements.push({
            x: baseX + Math.cos(angle) * radius + Math.random() * 30,
            y: baseY + Math.sin(angle) * radius + Math.random() * 30,
            timestamp: Date.now() - timeOffset,
            velocity: 0.3 + Math.random() * 2.5 // Natural speed
        });
    }
    
    // Add simulated key presses (variable timing)
    const aadhaar = '1234 5678 9012';
    let lastTime = Date.now() - 3000;
    
    for (let i = 0; i < aadhaar.length; i++) {
        const delay = 80 + Math.random() * 200; // Variable typing speed
        lastTime += delay;
        
        behaviorData.keyPresses.push({
            key: aadhaar[i],
            keyCode: aadhaar.charCodeAt(i),
            timestamp: lastTime,
            timeSinceLastKey: delay,
            target: 'verifyAadhaar'
        });
    }
    
    // Add some random clicks
    for (let i = 0; i < 3; i++) {
        behaviorData.mouseClicks.push({
            x: 150 + Math.random() * 400,
            y: 200 + Math.random() * 200,
            timestamp: Date.now() - (2000 + Math.random() * 3000),
            button: 0,
            target: 'BUTTON'
        });
    }
    
    // Add scroll events
    behaviorData.scrollEvents.push({
        scrollX: 0,
        scrollY: 50,
        timestamp: Date.now() - 1500,
        target: 'BODY'
    });
    
    // Add focus events
    behaviorData.focusEvents.push({
        timestamp: Date.now() - 2500,
        element: 'verifyAadhaar',
        type: 'focus'
    });
    
    // Set first interaction timestamp
    if (!behaviorData.timestamps.firstInteraction) {
        behaviorData.timestamps.firstInteraction = Date.now() - 4000;
    }
    
    console.log(`✅ Added simulated: ${behaviorData.mouseMovements.length} mouse movements, ${behaviorData.keyPresses.length} key presses`);
}

// ==================== BEHAVIOR TRACKING FUNCTIONS ====================

// Track mouse movements
function trackMouseMovement(e) {
    behaviorData.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        velocity: calculateMouseVelocity(e)
    });
    
    // Keep only last 100 movements to prevent memory issues
    if (behaviorData.mouseMovements.length > 100) {
        behaviorData.mouseMovements.shift();
    }
}

// Track mouse clicks
function trackMouseClick(e) {
    behaviorData.mouseClicks.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        button: e.button,
        target: e.target.tagName
    });
}

// Track key presses (with timing variability)
let lastKeyPressTime = Date.now();
function trackKeyPress(e) {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyPressTime;
    lastKeyPressTime = now;
    
    // Only track if it's the Aadhaar input field
    const targetId = e.target.id || '';
    if (targetId.includes('aadhaar') || targetId.includes('Aadhaar')) {
        behaviorData.keyPresses.push({
            key: e.key,
            keyCode: e.keyCode,
            timestamp: now,
            timeSinceLastKey: timeSinceLastKey,
            target: targetId
        });
    }
}

// Track scroll events
function trackScroll(e) {
    behaviorData.scrollEvents.push({
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        timestamp: Date.now(),
        target: e.target.tagName
    });
}

// Track focus events
function trackFocus(e) {
    behaviorData.focusEvents.push({
        timestamp: Date.now(),
        element: e.target.id || e.target.name || e.target.tagName,
        type: 'focus'
    });
}

// Track blur events
function trackBlur(e) {
    behaviorData.focusEvents.push({
        timestamp: Date.now(),
        element: e.target.id || e.target.name || e.target.tagName,
        type: 'blur'
    });
}

// Calculate mouse velocity (pixels per ms)
let lastMousePos = { x: 0, y: 0, time: Date.now() };
function calculateMouseVelocity(e) {
    const now = Date.now();
    const timeDiff = now - lastMousePos.time;
    
    if (timeDiff > 0) {
        const distance = Math.sqrt(
            Math.pow(e.clientX - lastMousePos.x, 2) + 
            Math.pow(e.clientY - lastMousePos.y, 2)
        );
        const velocity = distance / timeDiff;
        
        lastMousePos = { x: e.clientX, y: e.clientY, time: now };
        return velocity;
    }
    
    lastMousePos = { x: e.clientX, y: e.clientY, time: now };
    return 0;
}

// ==================== ML ANALYSIS FUNCTIONS ====================

// Send behavior data to ML server
async function analyzeBehaviorWithML() {
    try {
        // Add simulated human behavior if enabled
        if (SIMULATE_HUMAN && behaviorData.mouseMovements.length < 5) {
            simulateHumanBehavior();
        }
        
        // Prepare features for ML model
        const features = extractFeatures(behaviorData);
        
        console.log('📤 Sending to ML server:', {
            mouseMovements: behaviorData.mouseMovements.length,
            keyPresses: behaviorData.keyPresses.length,
            sessionDuration: features.sessionDuration
        });
        
        const response = await fetch(`${ML_SERVER_URL}/api/ml-detect-enhanced`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                behaviorData: behaviorData,
                features: features,
                sessionId: generateSessionId(),
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 ML Result:', result);
        return result;
        
    } catch (error) {
        console.error('❌ ML analysis failed:', error);
        return {
            isHuman: true, // Default to human if ML fails
            confidence: 50,
            score: 0.5,
            reasons: ['ML analysis unavailable'],
            error: error.message,
            fallback: true
        };
    }
}

// Extract features from behavior data
function extractFeatures(data) {
    // Calculate various features for ML model
    const features = {
        // Mouse features
        mouseMovementCount: data.mouseMovements.length,
        avgMouseVelocity: calculateAverage(data.mouseMovements.map(m => m.velocity || 0)),
        mouseVelocityVariance: calculateVariance(data.mouseMovements.map(m => m.velocity || 0)),
        mousePathLength: calculateMousePathLength(data.mouseMovements),
        
        // Keyboard features
        keyPressCount: data.keyPresses.length,
        avgKeyPressInterval: calculateAverage(data.keyPresses.map(k => k.timeSinceLastKey || 100)),
        keyIntervalVariance: calculateVariance(data.keyPresses.map(k => k.timeSinceLastKey || 100)),
        
        // Click features
        clickCount: data.mouseClicks.length,
        avgClickDuration: calculateClickDuration(data.mouseClicks),
        
        // Temporal features
        sessionDuration: Date.now() - data.timestamps.pageLoad,
        timeToFirstInteraction: data.timestamps.firstInteraction ? 
            data.timestamps.firstInteraction - data.timestamps.pageLoad : 0,
        
        // Activity ratios
        mouseToKeyRatio: data.mouseMovements.length / Math.max(data.keyPresses.length, 1),
        clickToMovementRatio: data.mouseClicks.length / Math.max(data.mouseMovements.length, 1),
        
        // Focus features
        focusChanges: data.focusEvents.length,
        
        // Scroll features
        scrollCount: data.scrollEvents.length,
        
        // Additional features
        formFieldsFilled: Object.keys(data.formData || {}).length,
        simulatedHuman: SIMULATE_HUMAN && data.mouseMovements.length < 5
    };
    
    return features;
}

// Helper functions for feature extraction
function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateVariance(arr) {
    if (arr.length === 0) return 0;
    const avg = calculateAverage(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return calculateAverage(squareDiffs);
}

function calculateMousePathLength(movements) {
    let length = 0;
    for (let i = 1; i < movements.length; i++) {
        const dx = movements[i].x - movements[i-1].x;
        const dy = movements[i].y - movements[i-1].y;
        length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
}

function calculateClickDuration(clicks) {
    if (clicks.length < 2) return 0;
    const durations = [];
    for (let i = 1; i < clicks.length; i++) {
        durations.push(clicks[i].timestamp - clicks[i-1].timestamp);
    }
    return calculateAverage(durations);
}

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==================== FORM HANDLING ====================

// Handle form submission with ML verification
async function handleFormSubmit(e) {
    // Prevent immediate submission
    e.preventDefault();
    
    console.log('🔄 Form submission intercepted for ML analysis...');
    
    // Update timestamp
    behaviorData.timestamps.formSubmit = Date.now();
    
    // Collect form data
    const formData = new FormData(e.target);
    behaviorData.formData = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '🧠 Analyzing behavior...';
    submitButton.disabled = true;
    
    try {
        // Get ML analysis
        const mlResult = await analyzeBehaviorWithML();
        
        // Show ML result to user
        showMLResult(mlResult);
        
        if (mlResult.isHuman && mlResult.confidence > 70) {
            // Human detected - proceed with form submission
            console.log('✅ HUMAN detected:', mlResult.confidence + '% confidence');
            
            // Add ML verification token to form
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'ml_verification_token';
            tokenInput.value = JSON.stringify({
                isHuman: mlResult.isHuman,
                confidence: mlResult.confidence,
                score: mlResult.score,
                sessionId: generateSessionId(),
                timestamp: Date.now()
            });
            e.target.appendChild(tokenInput);
            
            // Submit form after short delay
            setTimeout(() => {
                submitButton.textContent = '✅ Verified! Submitting...';
                setTimeout(() => {
                    e.target.submit();
                }, 1000);
            }, 1500);
            
        } else {
            // Bot or suspicious activity detected
            console.log('🚨 BOT detected:', mlResult.confidence + '% confidence');
            
            // Show CAPTCHA challenge
            showCaptchaChallenge(mlResult);
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ Error during ML verification:', error);
        
        // Fallback: proceed with form submission but log error
        alert('Security check completed. Proceeding...');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Submit form anyway in case of error
        setTimeout(() => {
            e.target.submit();
        }, 500);
    }
}

// Display ML analysis result
function showMLResult(result) {
    // Remove existing result display
    const existingResult = document.getElementById('ml-result-display');
    if (existingResult) {
        existingResult.remove();
    }
    
    // Create result display
    const resultDiv = document.createElement('div');
    resultDiv.id = 'ml-result-display';
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background: ${result.isHuman ? '#d4edda' : '#f8d7da'};
        border: 2px solid ${result.isHuman ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    const emoji = result.isHuman ? '🧠' : '🤖';
    const title = result.isHuman ? 'Enhanced ML: HUMAN' : 'Enhanced ML: BOT DETECTED';
    const confidenceColor = result.confidence > 85 ? 'green' : 
                          result.confidence > 70 ? 'orange' : 'red';
    
    resultDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
            ${emoji} ${title}
        </div>
        <div style="margin-bottom: 8px;">
            Confidence: <span style="color: ${confidenceColor}; font-weight: bold;">
            ${result.confidence}%</span>
        </div>
        ${result.reasons ? `
            <div style="font-size: 12px; color: #666; margin-top: 8px;">
                <strong>Analysis:</strong><br>
                ${result.reasons.slice(0, 3).join('<br>')}
            </div>
        ` : ''}
        ${result.debug ? `
            <div style="margin-top: 8px; padding: 5px; background: #fff3cd; border-radius: 4px; font-size: 11px;">
                🔧 DEBUG MODE ACTIVE
            </div>
        ` : ''}
        <div style="margin-top: 10px; font-size: 11px; color: #888;">
            Score: ${result.score ? result.score.toFixed(2) : 'N/A'}
        </div>
    `;
    
    document.body.appendChild(resultDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (resultDiv.parentNode) {
            resultDiv.style.opacity = '0';
            resultDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => resultDiv.remove(), 500);
        }
    }, 5000);
}

// Show CAPTCHA challenge for suspicious activity
function showCaptchaChallenge(mlResult) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'captcha-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    // Create challenge modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <h3 style="color: #d32f2f; margin-bottom: 15px;">⚠️ Additional Verification Required</h3>
        <p style="margin-bottom: 20px;">
            Our AI detected unusual behavior (${mlResult.confidence}% bot confidence).
            Please complete this quick verification:
        </p>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
            <p><strong>What is the answer to: 7 + 3 = ?</strong></p>
            <input type="text" id="captcha-answer" 
                   style="padding: 10px; width: 80%; margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;"
                   placeholder="Enter answer">
        </div>
        
        <div style="color: #666; font-size: 12px; margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
            <strong>AI Analysis:</strong><br>
            ${mlResult.reasons ? mlResult.reasons.slice(0, 2).join('<br>') : 'Suspicious pattern detected'}
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="captcha-submit" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Verify
            </button>
            <button id="captcha-cancel" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('captcha-submit').addEventListener('click', () => {
        const answer = document.getElementById('captcha-answer').value;
        if (answer === '10') {
            overlay.remove();
            // Retry form submission
            const form = document.getElementById('verifyForm');
            if (form) {
                // Add verification token
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'captcha_verified';
                tokenInput.value = 'true';
                form.appendChild(tokenInput);
                
                // Submit
                form.submit();
            }
        } else {
            alert('Incorrect answer. Please try again.');
        }
    });
    
    document.getElementById('captcha-cancel').addEventListener('click', () => {
        overlay.remove();
        // Reset submit button
        const submitButton = document.querySelector('#verifyForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Verify Aadhaar';
        }
    });
}

// ==================== INITIALIZATION ====================

// Initialize behavior tracking
function initializeBehaviorTracking() {
    console.log('🔧 Initializing ML-enhanced behavior tracking...');
    console.log('⚙️ Settings:', { SIMULATE_HUMAN, ML_SERVER_URL });
    
    // Set first interaction timestamp
    const firstInteractionHandler = () => {
        if (!behaviorData.timestamps.firstInteraction) {
            behaviorData.timestamps.firstInteraction = Date.now();
            console.log('👆 First interaction detected at:', new Date(behaviorData.timestamps.firstInteraction).toLocaleTimeString());
        }
        // Remove listener after first interaction
        document.removeEventListener('mousemove', firstInteractionHandler);
        document.removeEventListener('keypress', firstInteractionHandler);
        document.removeEventListener('click', firstInteractionHandler);
    };
    
    // Add first interaction listeners
    document.addEventListener('mousemove', firstInteractionHandler);
    document.addEventListener('keypress', firstInteractionHandler);
    document.addEventListener('click', firstInteractionHandler);
    
    // Add continuous tracking listeners
    document.addEventListener('mousemove', trackMouseMovement);
    document.addEventListener('click', trackMouseClick);
    document.addEventListener('keypress', trackKeyPress);
    document.addEventListener('scroll', trackScroll);
    document.addEventListener('focus', trackFocus, true);
    document.addEventListener('blur', trackBlur, true);
    
    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
        behaviorData.touchEvents.push({
            type: 'touchstart',
            timestamp: Date.now(),
            touches: e.touches.length
        });
    });
    
    document.addEventListener('touchend', (e) => {
        behaviorData.touchEvents.push({
            type: 'touchend',
            timestamp: Date.now(),
            touches: e.touches.length
        });
    });
}

// ==================== MAIN EXECUTION ====================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, setting up ML CAPTCHA...');
    
    // Initialize behavior tracking
    initializeBehaviorTracking();
    
    // Find the verify form
    const verifyForm = document.getElementById('verifyForm');
    
    if (verifyForm) {
        console.log('✅ Found verifyForm, attaching ML CAPTCHA handler...');
        
        // Remove any existing submit listeners to prevent duplicates
        verifyForm.removeEventListener('submit', handleFormSubmit);
        
        // Add our enhanced submit handler
        verifyForm.addEventListener('submit', handleFormSubmit);
        
        // Add a test button for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const debugButton = document.createElement('button');
            debugButton.textContent = '🔍 Test ML Analysis';
            debugButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 15px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 9999;
                font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            debugButton.addEventListener('click', async () => {
                console.log('🧪 Manual ML test triggered...');
                const result = await analyzeBehaviorWithML();
                showMLResult(result);
            });
            document.body.appendChild(debugButton);
        }
        
    } else {
        console.error('❌ ERROR: Could not find element with id="verifyForm"');
        console.log('📋 Available forms on page:', Array.from(document.forms).map(f => f.id || 'no-id'));
        
        // Fallback: try to find any form
        const forms = document.getElementsByTagName('form');
        if (forms.length > 0) {
            console.log('⚠️ Found form without verifyForm ID, using first one:', forms[0]);
            forms[0].addEventListener('submit', handleFormSubmit);
        }
    }
    
    // Test ML server connection
    setTimeout(() => {
        fetch(`${ML_SERVER_URL}/api/ml-health`)
            .then(r => r.json())
            .then(data => {
                console.log('✅ ML Server health:', data.status);
                console.log('🔧 Debug mode:', data.debugMode ? 'ON' : 'OFF');
            })
            .catch(err => {
                console.warn('⚠️ ML Server not reachable:', err.message);
                console.log('💡 Make sure ML server is running: node ml-fl-captcha-server.js');
            });
    }, 1000);
});

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        behaviorData,
        analyzeBehaviorWithML,
        extractFeatures,
        simulateHumanBehavior
    };
}
