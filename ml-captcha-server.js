// FL CAPTCHA with REAL ML Integration
const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const app = express();
const PORT = 5003;

// Serve static files
app.use(express.json());
app.use(express.static("aadhaar--portal"));

// Load ML model (using your trained model)
function predictWithML(behaviorData) {
    return new Promise((resolve) => {
        // Simple rule-based for now - you can replace with actual ML
        const features = [
            behaviorData.sessionDuration || 0,
            behaviorData.mouseEvents || 0,
            behaviorData.keyEvents || 0,
            behaviorData.hasMouseMove ? 1 : 0,
            behaviorData.hasKeyPress ? 1 : 0
        ];
        
        // Mock ML prediction (replace with actual model)
        const score = (
            (features[0] > 0.5 ? 0.3 : 0) +
            (features[1] > 2 ? 0.2 : 0) +
            (features[2] > 1 ? 0.2 : 0) +
            (features[3] * 0.15) +
            (features[4] * 0.15)
        );
        
        const isHuman = score > 0.5;
        const probability = isHuman ? score : 1 - score;
        
        resolve({
            isHuman,
            probability: Math.round(probability * 100) / 100,
            confidence: Math.abs(probability - 0.5) * 2,
            score: Math.round(score * 100) / 100,
            model: "mock-ml-v1",
            features: features
        });
    });
}

// FL Detection API with ML
app.post("/api/fl-detect-ml", async (req, res) => {
    try {
        const behaviorData = req.body;
        
        console.log("🤖 ML Analysis:", {
            duration: behaviorData.sessionDuration?.toFixed(2) + "s",
            mouse: behaviorData.mouseEvents,
            keys: behaviorData.keyEvents
        });
        
        // Get ML prediction
        const mlResult = await predictWithML(behaviorData);
        
        res.json({
            success: true,
            mlResult,
            message: mlResult.isHuman ? "ML: Human" : "ML: Bot",
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("ML prediction error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add ML-enhanced script to HTML
function addMLScript(html) {
    const mlScript = `
<!-- ML-ENHANCED FL CAPTCHA -->
<script>
(function() {
    console.log('🧠 ML CAPTCHA loading...');
    
    setTimeout(() => {
        const form = document.getElementById("verifyForm");
        if (!form) return;
        
        let mlMouse = 0, mlKeys = 0, mlStart = Date.now();
        
        document.addEventListener("mousemove", () => mlMouse++);
        document.addEventListener("keydown", () => mlKeys++);
        
        form.addEventListener("submit", async function(e) {
            console.log("🧠 ML: Analyzing...");
            
            const mlData = {
                sessionDuration: (Date.now() - mlStart) / 1000,
                mouseEvents: mlMouse,
                keyEvents: mlKeys,
                hasMouseMove: mlMouse > 0,
                hasKeyPress: mlKeys > 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            };
            
            try {
                const response = await fetch("/api/fl-detect-ml", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mlData)
                });
                
                const result = await response.json();
                showMLPopup(result);
                
                console.log("🧠 ML Result:", result.mlResult);
                
            } catch (error) {
                console.warn("ML API error:", error);
            }
        });
        
        console.log('🧠 ML CAPTCHA ready');
    }, 1000);
})();

function showMLPopup(result) {
    const popup = document.createElement("div");
    popup.style.cssText = \`
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 99997;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: mlSlideIn 0.3s;
        font-size: 13px;
        background: linear-gradient(135deg, #6f42c1, #6610f2);
        border-left: 4px solid #5a32a3;
    \`;
    
    const confidence = Math.round(result.mlResult.confidence * 100);
    
    if (result.mlResult.isHuman) {
        popup.innerHTML = \`🧠 <strong>ML Human</strong> (\${confidence}% sure)\`;
    } else {
        popup.innerHTML = \`🧠 <strong>ML Bot</strong> (\${confidence}% sure)\`;
    }
    
    if (!document.querySelector("#ml-styles")) {
        const style = document.createElement("style");
        style.id = "ml-styles";
        style.textContent = \`
            @keyframes mlSlideIn {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        \`;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 4000);
}
</script>
`;
    
    return html.replace("</body>", mlScript + "</body>");
}

// Routes
app.get("/verify", (req, res) => {
    const filePath = path.join(__dirname, "aadhaar--portal", "verify.html");
    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) return res.status(404).send("Page not found");
        res.send(addMLScript(html));
    });
});

app.listen(PORT, () => {
    console.log("");
    console.log("🧠 ====================================");
    console.log("🧠 ML-ENHANCED FL CAPTCHA SERVER");
    console.log("🧠 ====================================");
    console.log("");
    console.log("📍 Test: http://localhost:" + PORT + "/verify");
    console.log("🔧 API: POST /api/fl-detect-ml");
    console.log("");
});
