// security-check.js - CORNER POPUP LIKE YOUR SCREENSHOT
console.log("🚀 ML CAPTCHA Initializing");

let mlFeatures = {
    mouseMovements: 0,
    typingPattern: "none",
    timeOnPage: 0,
    scrolling: 0,
    inputChanges: 0,
    keyPressCount: 0,
    lastKeyTime: Date.now()
};

let startTime = Date.now();
let lastActiveTime = Date.now();

// Initialize ML tracking
function initMLCaptcha() {
    console.log("🔍 ML CAPTCHA System Initializing...");
    
    // Track mouse movements
    let mouseCount = 0;
    document.addEventListener('mousemove', () => {
        mouseCount++;
        mlFeatures.mouseMovements = Math.min(mouseCount / 80, 1.0);
    });
    
    // Track typing
    document.addEventListener('keydown', (e) => {
        mlFeatures.keyPressCount++;
        mlFeatures.inputChanges = Math.min(mlFeatures.inputChanges + 0.15, 1.0);
        mlFeatures.lastKeyTime = Date.now();
    });
    
    // Track time
    setInterval(() => {
        const timeSpent = (Date.now() - startTime) / 1000;
        mlFeatures.timeOnPage = Math.min(timeSpent / 15, 1.0);
    }, 1000);
    
    // Track scrolling
    let scrollCount = 0;
    window.addEventListener('scroll', () => {
        scrollCount++;
        mlFeatures.scrolling = Math.min(scrollCount / 12, 1.0);
    });
    
    // Track input changes
    document.addEventListener('input', () => {
        mlFeatures.inputChanges = Math.min(mlFeatures.inputChanges + 0.2, 1.0);
    });
    
    // Create popup
    createPopup();
    
    // Intercept form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const result = await sendToMLModel();
            
            if (result && result.success) {
                if (result.is_human) {
                    showMLPopup("✅ HUMAN DETECTED", "green");
                    setTimeout(() => {
                        hideMLPopup();
                        form.submit();
                    }, 1500);
                } else {
                    showMLPopup("❌ BOT DETECTED", "red");
                    setTimeout(() => {
                        hideMLPopup();
                    }, 2000);
                }
            } else {
                form.submit();
            }
        });
    });
    
    console.log("✅ ML CAPTCHA system loaded");
}

// Create popup in CORNER like your screenshot
function createPopup() {
    if (!document.getElementById('ml-captcha-popup')) {
        const popup = document.createElement('div');
        popup.id = 'ml-captcha-popup';
        
        // Position in corner like a notification
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
            padding: 15px 25px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            z-index: 99999;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 180px;
            border-left: 4px solid white;
        `;
        document.body.appendChild(popup);
    }
}

// Show popup in corner
function showMLPopup(message, color) {
    const popup = document.getElementById('ml-captcha-popup');
    if (!popup) return;
    
    // Set color based on type
    if (color === "green") {
        popup.style.backgroundColor = "#28a745";
    } else if (color === "red") {
        popup.style.backgroundColor = "#dc3545";
    } else {
        popup.style.backgroundColor = "#007bff";
    }
    
    // Set message with icon
    popup.innerHTML = message;
    
    // Show popup
    popup.style.display = 'block';
}

// Hide popup
function hideMLPopup() {
    const popup = document.getElementById('ml-captcha-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Extract features
function extractFeatures() {
    const timeSpent = (Date.now() - startTime) / 1000;
    
    return [
        mlFeatures.mouseMovements,
        mlFeatures.keyPressCount > 5 ? 0.8 : 0.3,
        Math.min(timeSpent / 10, 1.0),
        mlFeatures.scrolling,
        mlFeatures.inputChanges
    ];
}

// Send to ML model
async function sendToMLModel() {
    try {
        const features = extractFeatures();
        const sessionId = "ml_" + Date.now();
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({features: features, sessionId: sessionId})
        });
        
        return await response.json();
        
    } catch (error) {
        console.error('Error:', error);
        return {success: false};
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMLCaptcha);
} else {
    initMLCaptcha();
}