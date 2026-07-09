// CORRECTED login-detection.js - Uses verifyForm not loginForm
(function() {
    'use strict';
    
    console.log('🔒 Original CAPTCHA loading...');
    
    // Wait for DOM
    function init() {
        const form = document.getElementById('verifyForm'); // CHANGED: verifyForm
        const popup = document.querySelector('.captcha-popup');
        
        if (!form) {
            console.warn('⚠️ Original CAPTCHA: Form not found (looking for verifyForm)');
            return;
        }
        
        console.log('✅ Original CAPTCHA: Form found');
        
        // Test mode
        const TEST_MODE = window.location.search.includes('testMode=true');
        
        // Behavior tracking
        let sessionStartTime = Date.now();
        let mouseEvents = 0;
        let keyEvents = 0;
        let hasMouseMove = false;
        let hasKeyPress = false;
        
        // Event listeners
        document.addEventListener('mousemove', () => {
            mouseEvents++;
            hasMouseMove = true;
        });
        
        document.addEventListener('keydown', () => {
            keyEvents++;
            hasKeyPress = true;
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            console.log('🔒 Original CAPTCHA: Form submit intercepted');
            
            if (!TEST_MODE) {
                e.preventDefault();
            }
            
            const sessionDuration = (Date.now() - sessionStartTime) / 1000;
            const isHuman = sessionDuration > 0.5 && (hasMouseMove || hasKeyPress);
            
            // Show original popup
            if (popup) {
                popup.textContent = isHuman ? '✅ Human' : '🚨 Bot';
                popup.style.display = 'block';
                setTimeout(() => popup.style.display = 'none', 3000);
            }
            
            // Submit if human
            if (isHuman) {
                setTimeout(() => {
                    if (!TEST_MODE) form.submit();
                }, 2000);
            }
            
            console.log('🔒 Original CAPTCHA: Decision =', isHuman ? 'Human' : 'Bot');
        });
        
        console.log('🔒 Original CAPTCHA ready');
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();
