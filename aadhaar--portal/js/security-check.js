// aadhaar-portal/js/security-check.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Security Check JS Loaded');
    
    const form = document.getElementById('verifyForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (form && submitBtn) {
        console.log('Form and submit button found');
        
        // Disable default form submission
        form.addEventListener('submit', function(e) {
            console.log('Form submit event triggered');
            e.preventDefault(); // CRITICAL: Prevent default form submission
            return false;
        });
        
        // Add click handler to submit button
        submitBtn.addEventListener('click', async function(e) {
            console.log('Submit button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Collect behavioral data
            const behaviorData = {
                mouse_movements: window.mouseMovements || 0,
                typing_pattern: window.typingPattern || 'none',
                time_on_page: Math.floor((Date.now() - window.pageLoadTime) / 1000),
                scroll_events: window.scrollEvents || 0,
                click_pattern: window.clickPattern || 'none',
                input_changes: window.inputChanges || 0
            };
            
            console.log('Behavior data:', behaviorData);
            
            try {
                // Send to ML model for prediction
                const response = await fetch('http://localhost:5000/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(behaviorData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('ML Prediction result:', result);
                
                // Show appropriate popup
                if (result.prediction === 'BOT') {
                    alert('BOT DETECTED');
                    // Optional: Clear form or show error
                    return false;
                } else if (result.prediction === 'HUMAN') {
                    alert('HUMAN DETECTED');
                    
                    // After showing alert, submit the form normally
                    // Remove the submit event listener temporarily to avoid loop
                    form.removeEventListener('submit', arguments.callee);
                    form.submit();
                }
                
            } catch (error) {
                console.error('Error during ML check:', error);
                // Fallback: submit form if ML check fails
                alert('Security check failed. Please try again.');
                form.submit();
            }
            
            return false;
        });
    } else {
        console.error('Form or submit button not found!');
    }
    
    // Initialize behavior tracking
    window.pageLoadTime = Date.now();
    window.mouseMovements = 0;
    window.scrollEvents = 0;
    window.inputChanges = 0;
    window.clickPattern = 'single';
    window.typingPattern = 'none';
    
    // Track mouse movements
    document.addEventListener('mousemove', () => {
        window.mouseMovements++;
    });
    
    // Track scrolling
    document.addEventListener('scroll', () => {
        window.scrollEvents++;
    });
    
    // Track input changes
    const aadhaarInput = document.getElementById('aadhaar_number');
    if (aadhaarInput) {
        aadhaarInput.addEventListener('input', () => {
            window.inputChanges++;
            window.typingPattern = 'random';
        });
    }
});