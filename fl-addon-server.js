// FL CAPTCHA SERVER - Compatible with existing scripts
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5003;

// Middleware
app.use(express.json());
app.use(express.static("aadhaar--portal"));

// FL Detection API
app.post("/api/fl-detect", (req, res) => {
    const data = req.body;
    console.log("🤖 FL Analysis:", {
        duration: data.sessionDuration?.toFixed(2) + "s",
        mouse: data.mouseEvents,
        keys: data.keyEvents
    });
    
    // Enhanced detection
    let score = 0;
    if (data.sessionDuration > 0.5) score += 0.3;
    if (data.mouseEvents > 2) score += 0.2;
    if (data.keyEvents > 1) score += 0.2;
    if (data.hasMouseMove) score += 0.15;
    if (data.hasKeyPress) score += 0.15;
    
    const isHuman = score > 0.5;
    
    res.json({
        success: true,
        flResult: {
            isHuman,
            probability: isHuman ? score : 1 - score,
            confidence: Math.abs(score - 0.5) * 2,
            score: Math.round(score * 100) / 100
        },
        message: isHuman ? "FL Human Verified" : "FL Bot Detected"
    });
});

// Helper to add FL script
function addFLScript(html) {
    const flScript = `
<!-- FL CAPTCHA ADDON -->
<script>
// FL CAPTCHA Addon - Works alongside existing scripts
(function() {
    console.log('🤖 FL CAPTCHA addon loading...');
    
    // Wait for page to load
    setTimeout(() => {
        // Track behavior
        let flMouse = 0;
        let flKeys = 0;
        let flStart = Date.now();
        
        document.addEventListener("mousemove", () => flMouse++);
        document.addEventListener("keydown", () => flKeys++);
        
        // Find form and add FL detection
        const form = document.getElementById("verifyForm");
        if (form) {
            console.log("✅ FL: Found verifyForm");
            
            // Store original submit
            const originalSubmit = form.onsubmit;
            
            // Add FL handler
            form.addEventListener("submit", async function(e) {
                console.log("✅ FL: Form submit intercepted");
                
                // Collect FL data
                const flData = {
                    sessionDuration: (Date.now() - flStart) / 1000,
                    mouseEvents: flMouse,
                    keyEvents: flKeys,
                    hasMouseMove: flMouse > 0,
                    hasKeyPress: flKeys > 0
                };
                
                console.log("📊 FL Data:", flData);
                
                try {
                    // Call FL API
                    const response = await fetch("/api/fl-detect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(flData)
                    });
                    
                    const result = await response.json();
                    
                    // Show FL popup (in addition to existing popup)
                    showFLPopup(result);
                    
                } catch (error) {
                    console.warn("FL API error:", error);
                }
            });
            
            console.log("🤖 FL CAPTCHA addon ready");
        } else {
            console.warn("❌ FL: Could not find verifyForm");
        }
    }, 1000); // Wait 1 second for other scripts to load
})();

function showFLPopup(result) {
    // Create FL popup (different from existing popup)
    const popup = document.createElement("div");
    popup.id = "fl-captcha-popup";
    popup.style.cssText = \`
        position: fixed;
        top: 60px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 99998;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: flSlideIn 0.3s;
        font-size: 13px;
        border-left: 4px solid;
    \`;
    
    if (result.flResult.isHuman) {
        popup.innerHTML = '🤖 <strong>FL: Human</strong> (' + Math.round(result.flResult.probability * 100) + '%)';
        popup.style.background = "#28a745";
        popup.style.borderColor = "#1e7e34";
    } else {
        popup.innerHTML = '🤖 <strong>FL: Bot</strong> (' + Math.round(result.flResult.probability * 100) + '%)';
        popup.style.background = "#dc3545";
        popup.style.borderColor = "#c82333";
    }
    
    // Add animation
    if (!document.querySelector("#fl-styles")) {
        const style = document.createElement("style");
        style.id = "fl-styles";
        style.textContent = \`
            @keyframes flSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes flSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    // Auto remove
    setTimeout(() => {
        popup.style.animation = "flSlideOut 0.3s forwards";
        setTimeout(() => {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 300);
    }, 4000);
}
</script>
<!-- END FL CAPTCHA ADDON -->
`;
    
    return html.replace("</body>", flScript + "</body>");
}

// Serve verify.html with FL addon
app.get("/verify", (req, res) => {
    const filePath = path.join(__dirname, "aadhaar--portal", "verify.html");
    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) {
            res.status(404).send("Page not found");
            return;
        }
        res.send(addFLScript(html));
    });
});

// Serve other pages normally
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "index.html"));
});

app.get("/check-status", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "check-status.html"));
});

// Health check
app.get("/api/fl-health", (req, res) => {
    res.json({
        status: "OK",
        service: "FL CAPTCHA Addon",
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("🤖 ====================================");
    console.log("🤖 FL CAPTCHA ADDON SERVER");
    console.log("🤖 ====================================");
    console.log("");
    console.log("📍 Test: http://localhost:" + PORT + "/verify");
    console.log("🔧 API: POST /api/fl-detect");
    console.log("🏥 Health: GET /api/fl-health");
    console.log("");
    console.log("💡 This works ALONGSIDE your existing CAPTCHA");
    console.log("💡 You should see BOTH popups:");
    console.log("   1. Your existing popup");
    console.log("   2. New FL popup (🤖 FL: Human/Bot)");
    console.log("");
});
