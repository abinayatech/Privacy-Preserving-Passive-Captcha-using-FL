// ==================== AADHAAR NUMBER FORMATTING ====================
// Automatically formats Aadhaar numbers as XXXX XXXX XXXX (12 digits total)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔢 Aadhaar formatting system active');
    
    // Format ALL Aadhaar input fields
    const aadhaarInputs = document.querySelectorAll('input[maxlength="14"], #eid, #aadhaarNo, #updateAadhaar, #verifyAadhaar');
    
    aadhaarInputs.forEach(input => {
        if (!input) return;
        
        // Format as user types
        input.addEventListener('input', function(e) {
            // Remove all non-digits and keep only first 12 digits
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 12) {
                value = value.substring(0, 12);
            }
            
            // Add space after every 4 digits
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            
            e.target.value = formatted;
            
            // Show format hint
            showFormatHint(input);
        });
        
        // Show format hint on focus
        input.addEventListener('focus', function() {
            showFormatHint(input);
        });
        
        // Validate on blur
        input.addEventListener('blur', function() {
            validateAadhaarFormat(input);
        });
    });
    
    // Show format hint below input
    function showFormatHint(input) {
        let hint = input.parentNode.querySelector('.format-hint');
        if (!hint) {
            hint = document.createElement('small');
            hint.className = 'format-hint';
            hint.style.cssText = 'display: block; color: #666; font-size: 12px; margin-top: 5px;';
            input.parentNode.appendChild(hint);
        }
        hint.textContent = 'Format: XXXX XXXX XXXX (12 digits)';
    }
    
    // Validate format
    function validateAadhaarFormat(input) {
        const value = input.value.replace(/\s/g, '');
        const hint = input.parentNode.querySelector('.format-hint');
        
        if (value.length === 0) {
            if (hint) hint.style.color = '#666';
            input.style.borderColor = '';
            return;
        }
        
        if (value.length !== 12) {
            if (hint) {
                hint.textContent = `❌ Requires 12 digits (you have ${value.length})`;
                hint.style.color = '#dc3545';
            }
            input.style.borderColor = '#dc3545';
        } else {
            if (hint) {
                hint.textContent = '✅ Valid 12-digit format';
                hint.style.color = '#28a745';
            }
            input.style.borderColor = '#28a745';
        }
    }
    
    // Add form validation for Aadhaar fields
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const aadhaarFields = form.querySelectorAll('input[maxlength="14"], #eid, #aadhaarNo, #updateAadhaar, #verifyAadhaar');
            let hasInvalidAadhaar = false;
            
            aadhaarFields.forEach(field => {
                if (field && field.value.trim() !== '') {
                    const digitsOnly = field.value.replace(/\s/g, '').replace(/\D/g, '');
                    if (digitsOnly.length !== 12) {
                        hasInvalidAadhaar = true;
                        field.style.borderColor = '#dc3545';
                        
                        // Show error
                        let error = field.parentNode.querySelector('.submit-error');
                        if (!error) {
                            error = document.createElement('small');
                            error.className = 'submit-error';
                            error.style.cssText = 'color: #dc3545; display: block; margin-top: 5px;';
                            field.parentNode.appendChild(error);
                        }
                        error.textContent = 'Please enter a valid 12-digit Aadhaar number';
                    }
                }
            });
            
            // Don't prevent form submission - let your behavior tracking handle it
            // The Aadhaar validation is just visual feedback
        });
    });
});

// ==================== HUMAN/BOT DETECTION MESSAGES ====================
// Shows detection messages without connection errors
let detectionMessagesEnabled = true;

// Simple activity tracking for local detection
let localActivity = {
    mouseMoves: 0,
    keyPresses: 0,
    startTime: Date.now(),
    clicks: 0
};

// Track activity locally (separate from your main tracking)
document.addEventListener('mousemove', () => {
    if (detectionMessagesEnabled) localActivity.mouseMoves++;
});

document.addEventListener('keydown', () => {
    if (detectionMessagesEnabled) localActivity.keyPresses++;
});

document.addEventListener('click', () => {
    if (detectionMessagesEnabled) localActivity.clicks++;
});

// Show detection message (called from your existing form handler)
function showHumanBotDetection(result) {
    if (!detectionMessagesEnabled) return;
    
    // Determine if human or bot based on ML result
    const isHuman = result.success === true || 
                   (result.detection && result.detection.label === 'human') ||
                   (result.action === 'allow');
    
    // Create message box
    const messageBox = document.createElement('div');
    messageBox.className = 'human-bot-detection-msg';
    messageBox.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease-out;
        max-width: 320px;
        font-size: 14px;
        border-left: 4px solid;
    `;
    
    if (isHuman) {
        messageBox.style.background = "#28a745";
        messageBox.style.borderLeftColor = "#1e7e34";
        messageBox.innerHTML = `
            ✅ <strong>Human Verified</strong>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                Natural behavior patterns detected
            </div>
        `;
    } else {
        messageBox.style.background = "#dc3545";
        messageBox.style.borderLeftColor = "#c82333";
        messageBox.innerHTML = `
            ❌ <strong>Suspicious Activity</strong>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
                Automated behavior detected
            </div>
        `;
    }
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        position: absolute;
        top: 5px;
        right: 10px;
        opacity: 0.7;
    `;
    closeBtn.onclick = () => messageBox.remove();
    messageBox.appendChild(closeBtn);
    
    document.body.appendChild(messageBox);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageBox.parentElement) {
            messageBox.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (messageBox.parentElement) messageBox.remove();
            }, 300);
        }
    }, 5000);
}

// Add animation styles for detection messages
if (!document.getElementById('detection-animations')) {
    const style = document.createElement('style');
    style.id = 'detection-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ==================== INTEGRATION WITH EXISTING CODE ====================
// Modify your existing form submission to call showHumanBotDetection

// Find your existing form submission code and add this line:
// In the form submit event handler, after getting the ML result, add:
// showHumanBotDetection(result);

// Example of how to integrate (find your existing code and modify):
// In your existing code where you have:
// const result = await response.json();
// console.log("ML Analysis Result:", result);
//
// ADD THIS LINE RIGHT AFTER:
// showHumanBotDetection(result);

// ==================== LOCAL FALLBACK DETECTION ====================
// If your ML backend is unavailable, use this local detection
function localHumanBotDetection() {
    const duration = (Date.now() - localActivity.startTime) / 1000;
    
    // Simple detection logic
    if (localActivity.mouseMoves === 0 && localActivity.keyPresses === 0 && localActivity.clicks === 0) {
        return { isHuman: false, confidence: 0.85, reason: "No user interaction detected" };
    }
    
    if (localActivity.mouseMoves > 10 && localActivity.clicks > 0) {
        return { isHuman: true, confidence: 0.90, reason: "Natural mouse and click patterns" };
    }
    
    if (duration > 5 && localActivity.keyPresses > 0) {
        return { isHuman: true, confidence: 0.75, reason: "Sustained interaction over time" };
    }
    
    // Default to human (less restrictive)
    return { isHuman: true, confidence: 0.65, reason: "Insufficient data for bot detection" };
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        showHumanBotDetection, 
        localHumanBotDetection,
        formatAadhaarNumber: function(value) {
            // Helper function to format Aadhaar numbers
            const digits = value.replace(/\D/g, '').substring(0, 12);
            let formatted = '';
            for (let i = 0; i < digits.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += digits[i];
            }
            return formatted;
        }
    };
}

console.log('✅ Aadhaar formatting & detection messages system loaded');