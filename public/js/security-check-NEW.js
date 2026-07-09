// NEW FILE: security-check-NEW.js - CORRECT FORMAT
console.log("🚀 NEW JS FILE LOADED - " + new Date().toLocaleTimeString());

function initMLCaptcha() {
    console.log("🔄 Initializing NEW version...");
    
    const form = document.getElementById("verifyForm");
    const button = document.getElementById("submitBtn");
    
    console.log("Elements:", { form: !!form, button: !!button });
    
    if (!form || !button) {
        console.error("Missing elements!");
        return;
    }
    
    // VISUAL CONFIRMATION - Make button RED
    button.style.cssText = `
        background: red !important;
        color: white !important;
        border: 5px solid yellow !important;
        padding: 20px !important;
        font-size: 20px !important;
        font-weight: bold !important;
    `;
    button.textContent = "🔴 NEW JS - CLICK ME";
    
    // Track behavior
    let mouse = 0, scroll = 0, inputs = 0;
    const start = Date.now();
    
    document.addEventListener("mousemove", () => mouse++);
    document.addEventListener("scroll", () => scroll++);
    
    const inputField = document.getElementById("aadhaar_number");
    if (inputField) {
        inputField.addEventListener("input", () => inputs++);
    }
    
    // Prevent form submit
    form.onsubmit = e => e.preventDefault();
    
    // Button click - CORRECT FORMAT
    button.onclick = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("🎯 NEW JS: Button clicked!");
        
        // Show FIRST alert
        alert("🆕 NEW JS VERSION! Sending correct format...");
        
        // Calculate 5 features
        const time = (Date.now() - start) / 1000;
        const features = [
            Math.min(mouse / 100, 1),
            inputs > 0 ? 0.7 : 0.3,
            Math.min(time / 10, 1),
            Math.min(scroll / 10, 1),
            Math.min(inputs / 5, 1)
        ];
        
        console.log("CORRECT format - features array:", features);
        
        // Send CORRECT format
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                features: features,  // Array of 5 numbers
                sessionId: "newjs_" + Date.now()
            })
        });
        
        const result = await response.json();
        console.log("✅ Response:", JSON.stringify(result, null, 2));
        
        // Show popup
        if (result.prediction === "BOT") {
            alert("🚫 BOT DETECTED");
            button.style.background = "darkred";
            button.textContent = "❌ BOT";
            if (inputField) inputField.value = "";
        } 
        else if (result.prediction === "HUMAN") {
            alert("✅ HUMAN DETECTED");
            button.style.background = "green";
            button.textContent = "✅ HUMAN";
            
            // Submit form
            setTimeout(() => form.submit(), 1000);
        }
        else {
            alert("Error: " + (result.error || "Unknown"));
        }
    };
    
    console.log("✅ NEW JS ready! Button is RED with yellow border");
}

// Start
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMLCaptcha);
} else {
    initMLCaptcha();
}
