// js/detection.js - Shows human/bot detection only (NO connection errors)
console.log('🔍 Passive CAPTCHA System Active');

let userActivity = {
    keyPresses: 0,
    mouseMoves: 0,
    clicks: 0,
    startTime: Date.now()
};

document.addEventListener("keydown", () => userActivity.keyPresses++);
document.addEventListener("mousemove", () => userActivity.mouseMoves++);
document.addEventListener("click", () => userActivity.clicks++);

function detectUserType() {
    const duration = (Date.now() - userActivity.startTime) / 1000;
    
    if (userActivity.mouseMoves === 0 && userActivity.keyPresses === 0 && userActivity.clicks === 0) {
        return "🤖 Bot detected";
    }
    if (userActivity.mouseMoves > 10 || userActivity.clicks > 0) {
        return "👤 Human detected";
    }
    if (duration > 5 && userActivity.keyPresses < 2) {
        return "🤖 Suspicious activity";
    }
    return "👤 Human detected";
}

function showDetectionResult() {
    const result = detectUserType();
    let detectionBox = document.querySelector(".detection-result-box");
    
    if (!detectionBox) {
        detectionBox = document.createElement("div");
        detectionBox.className = "detection-result-box";
        detectionBox.style.cssText = `
            position: fixed; top: 100px; right: 20px; padding: 15px 20px;
            border-radius: 8px; color: white; font-weight: 600; z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out;
            max-width: 300px; font-size: 14px; display: none; border-left: 4px solid;
        `;
        document.body.appendChild(detectionBox);
    }
    
    if (result.includes("Human")) {
        detectionBox.style.background = "#28a745";
        detectionBox.style.borderLeftColor = "#1e7e34";
        detectionBox.textContent = "✅ " + result;
    } else {
        detectionBox.style.background = "#dc3545";
        detectionBox.style.borderLeftColor = "#c82333";
        detectionBox.textContent = "❌ " + result;
    }
    
    detectionBox.style.display = "block";
    setTimeout(() => {
        detectionBox.style.display = "none";
    }, 5000);
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ Detection system ready");
    setTimeout(showDetectionResult, 2000);
});