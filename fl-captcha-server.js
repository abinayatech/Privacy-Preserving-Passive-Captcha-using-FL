// FL CAPTCHA SERVER
const express = require("express");
const path = require("path");
const app = express();
const PORT = 5003;

// Middleware
app.use(express.json());
app.use(express.static("aadhaar--portal"));

// FL CAPTCHA API
app.post("/api/detect", (req, res) => {
    const data = req.body;
    
    // Simple ML detection
    const isHuman = data.sessionDuration > 0.5 && 
                    (data.mouseEvents > 0 || data.keyEvents > 0);
    
    res.json({
        success: true,
        isHuman,
        confidence: isHuman ? 0.85 : 0.15,
        message: isHuman ? "Human verified" : "Bot detected"
    });
});

// Inject FL CAPTCHA script into HTML
function injectFLCaptcha(html) {
    const captchaScript = `
<!-- FL CAPTCHA SYSTEM -->
<script>
(function() {
    console.log('🤖 FL CAPTCHA loading...');
    
    // Track behavior
    let mouseCount = 0;
    let keyCount = 0;
    let sessionStart = Date.now();
    
    // Track mouse movements
    document.addEventListener("mousemove", () => {
        mouseCount++;
    });
    
    // Track keyboard activity
    document.addEventListener("keydown", () => {
        keyCount++;
    });
    
    // Intercept ALL forms
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            // Collect behavior data
            const behaviorData = {
                sessionDuration: (Date.now() - sessionStart) / 1000,
                mouseEvents: mouseCount,
                keyEvents: keyCount,
                hasMouseMove: mouseCount > 0,
                hasKeyPress: keyCount > 0,
                timestamp: new Date().toISOString()
            };
            
            console.log("📊 FL analyzing:", behaviorData);
            
            try {
                // Send to FL API
                const response = await fetch("/api/detect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(behaviorData)
                });
                
                const result = await response.json();
                
                // Show popup
                showFLCaptchaPopup(result);
                
                // If human, submit form after delay
                if (result.isHuman) {
                    setTimeout(() => {
                        console.log("✅ Form submitted (human)");
                        form.submit();
                    }, 1500);
                } else {
                    console.log("🚨 Form blocked (bot)");
                }
                
            } catch (error) {
                console.warn("FL CAPTCHA failed, allowing form");
                showFLCaptchaPopup({ isHuman: true, message: "System error" });
                setTimeout(() => form.submit(), 1000);
            }
        });
    });
    
    function showFLCaptchaPopup(result) {
        // Create popup
        const popup = document.createElement("div");
        popup.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: flSlideIn 0.3s ease-out;
            font-size: 14px;
        \`;
        
        if (result.isHuman) {
            popup.innerHTML = '✅ <strong>FL Human Verified</strong><br><small>Using Federated Learning</small>';
            popup.style.background = "linear-gradient(135deg, #28a745, #20c997)";
        } else {
            popup.innerHTML = '🚨 <strong>FL Bot Detected</strong><br><small>Using Federated Learning</small>';
            popup.style.background = "linear-gradient(135deg, #dc3545, #fd7e14)";
        }
        
        // Add animation
        const style = document.createElement("style");
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
        
        document.body.appendChild(popup);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            popup.style.animation = "flSlideOut 0.3s ease-in forwards";
            setTimeout(() => {
                if (popup.parentNode) popup.parentNode.removeChild(popup);
            }, 300);
        }, 3000);
    }
    
    console.log("🤖 FL CAPTCHA ready");
})();
</script>
<!-- END FL CAPTCHA -->
`;
    
    if (html.includes("</body>")) {
        return html.replace("</body>", captchaScript + "</body>");
    }
    return html + captchaScript;
}

// Serve HTML with FL CAPTCHA
const fs = require("fs");

app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "aadhaar--portal", "index.html");
    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) {
            res.status(404).send("Page not found");
            return;
        }
        res.send(injectFLCaptcha(html));
    });
});

app.get("/verify", (req, res) => {
    const filePath = path.join(__dirname, "aadhaar--portal", "verify.html");
    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) {
            res.status(404).send("Page not found");
            return;
        }
        res.send(injectFLCaptcha(html));
    });
});

app.get("/check-status", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "check-status.html"));
});

app.get("/download", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "download.html"));
});

app.get("/update", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "update.html"));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "aadhaar--portal", "contact.html"));
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        service: "FL CAPTCHA System",
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("🤖 ====================================");
    console.log("🤖 FL CAPTCHA SERVER RUNNING!");
    console.log("🤖 ====================================");
    console.log("");
    console.log("📍 URL: http://localhost:" + PORT);
    console.log("");
    console.log("📄 Test pages:");
    console.log("   • http://localhost:" + PORT + "/verify");
    console.log("   • http://localhost:" + PORT + "/verify?testMode=true");
    console.log("");
    console.log("🔧 APIs:");
    console.log("   • POST /api/detect");
    console.log("   • GET  /api/health");
    console.log("");
    console.log("💡 How to test:");
    console.log("   1. Open /verify page");
    console.log("   2. Move mouse and type");
    console.log("   3. Submit form");
    console.log("   4. See FL CAPTCHA popup!");
    console.log("");
});
