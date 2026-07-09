// login-detection-fixed.js - Sends to /predict for terminal accuracy display
(function() {
    'use strict';
    
    console.log('🔒 FIXED CAPTCHA LOADING - Will show accuracy in VS Code terminal!');
    console.log('📊 Watch the VS Code terminal for detailed accuracy logs!');
    
    // Wait for DOM
    function init() {
        // Try both possible form IDs
        const form = document.getElementById('statusForm') || document.getElementById('verifyForm');
        const popup = document.querySelector('.captcha-popup');
        
        if (!form) {
            console.warn('⚠️ CAPTCHA: Form not found (looked for statusForm or verifyForm)');
            return;
        }
        
        console.log('✅ CAPTCHA: Form found with ID:', form.id);
        
        // Create a small indicator that ML is active
        const mlIndicator = document.createElement('div');
        mlIndicator.id = 'ml-indicator';
        mlIndicator.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#667eea; color:white; padding:5px 10px; border-radius:20px; font-size:12px; z-index:9999; opacity:0.8;';
        mlIndicator.innerHTML = '🔍 ML Active - Check Terminal';
        document.body.appendChild(mlIndicator);
        
        // Behavior tracking
        let sessionStartTime = Date.now();
        let mouseMovements = 0;
        let keyPresses = 0;
        let scrollEvents = 0;
        let inputChanges = 0;
        
        // Enhanced tracking for ML features
        document.addEventListener('mousemove', () => {
            mouseMovements++;
        });
        
        document.addEventListener('keydown', () => {
            keyPresses++;
        });
        
        document.addEventListener('scroll', () => {
            scrollEvents++;
        });
        
        document.addEventListener('input', () => {
            inputChanges++;
        });
        
        // Form submission
        form.addEventListener('submit', async function(e) {
            console.log('🔒 CAPTCHA: Form submit intercepted - sending to /predict');
            e.preventDefault();
            
            // Show loading state in popup
            if (popup) {
                popup.textContent = '🔍 Analyzing with ML...';
                popup.style.display = 'block';
                popup.style.backgroundColor = '#ffc107';
                popup.style.color = '#000';
                popup.style.padding = '15px';
                popup.style.borderRadius = '5px';
                popup.style.fontWeight = 'bold';
            }
            
            // Calculate features (normalized between 0 and 1)
            const timeOnPage = Math.min((Date.now() - sessionStartTime) / 10000, 1); // max 10 seconds
            
            const features = [
                Math.min(mouseMovements / 50, 1.0),  // mouse_activity
                Math.min(keyPresses / 20, 1.0),      // typing_activity
                timeOnPage,                           // time_on_page
                Math.min(scrollEvents / 10, 1.0),    // scroll_activity
                Math.min(inputChanges / 15, 1.0)     // input_changes
            ];
            
            console.log('📤 Sending to ML model:', {
                mouseMovements,
                keyPresses,
                timeOnPage: timeOnPage.toFixed(2),
                scrollEvents,
                inputChanges,
                features: features.map(f => f.toFixed(3))
            });
            
            try {
                // Send to /predict endpoint
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        features: features,
                        sessionId: 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Log to browser console
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 ML PREDICTION RESULT');
                    console.log('='.repeat(60));
                    console.log('   Prediction:', result.prediction.toUpperCase());
                    console.log('   Confidence:', (result.confidence * 100).toFixed(1) + '%');
                    console.log('   Correct:', result.is_correct ? '✅ YES' : '❌ NO');
                    console.log('   Actual:', result.actual_label.toUpperCase());
                    console.log('='.repeat(60));
                    console.log('🔍 CHECK VS CODE TERMINAL FOR FULL ACCURACY DETAILS!');
                    
                    // Show in popup
                    if (popup) {
                        if (result.is_human) {
                            popup.innerHTML = `
                                <div style="text-align:center;">
                                    <div style="font-size:24px; margin-bottom:5px;">✅</div>
                                    <div style="font-weight:bold; font-size:18px;">HUMAN DETECTED</div>
                                    <div style="font-size:14px; margin:5px 0;">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                                    <div style="font-size:12px; opacity:0.9;">${result.is_correct ? '✓ Correct' : '✗ Wrong'}</div>
                                    <div style="font-size:10px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.3); padding-top:5px;">
                                        Check VS Code terminal for full accuracy
                                    </div>
                                </div>
                            `;
                            popup.style.backgroundColor = '#28a745';
                            popup.style.color = 'white';
                            popup.style.padding = '20px';
                            popup.style.borderRadius = '10px';
                        } else {
                            popup.innerHTML = `
                                <div style="text-align:center;">
                                    <div style="font-size:24px; margin-bottom:5px;">🤖</div>
                                    <div style="font-weight:bold; font-size:18px;">BOT DETECTED</div>
                                    <div style="font-size:14px; margin:5px 0;">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                                    <div style="font-size:12px; opacity:0.9;">${result.is_correct ? '✓ Correct' : '✗ Wrong'}</div>
                                    <div style="font-size:10px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.3); padding-top:5px;">
                                        Check VS Code terminal for full accuracy
                                    </div>
                                </div>
                            `;
                            popup.style.backgroundColor = '#dc3545';
                            popup.style.color = 'white';
                            popup.style.padding = '20px';
                            popup.style.borderRadius = '10px';
                        }
                        popup.style.display = 'block';
                    }
                    
                    // Decision based on ML result
                    if (result.is_human) {
                        console.log('✅ ML says HUMAN - submitting form in 2 seconds');
                        setTimeout(() => {
                            if (popup) {
                                popup.style.display = 'none';
                            }
                            document.getElementById('ml-indicator')?.remove();
                            form.submit();
                        }, 2000);
                    } else {
                        console.log('❌ ML says BOT - blocking form for 5 seconds');
                        setTimeout(() => {
                            if (popup) {
                                popup.style.display = 'none';
                            }
                        }, 5000);
                    }
                } else {
                    console.error('ML Error:', result.error);
                    // Fallback to simple detection
                    fallbackDetection(form, popup, mouseMovements, keyPresses, sessionStartTime);
                }
                
            } catch (error) {
                console.error('Error calling ML:', error);
                // Fallback to simple detection
                fallbackDetection(form, popup, mouseMovements, keyPresses, sessionStartTime);
            }
        });
        
        console.log('✅ FIXED CAPTCHA ready - SUBMIT FORM TO SEE ACCURACY IN VS CODE TERMINAL!');
        console.log('📊 Open VS Code and watch the terminal where flask_server.py is running!');
    }
    
    // Fallback simple detection
    function fallbackDetection(form, popup, mouseMovements, keyPresses, sessionStartTime) {
        const sessionDuration = (Date.now() - sessionStartTime) / 1000;
        const isHuman = sessionDuration > 0.5 && (mouseMovements > 0 || keyPresses > 0);
        
        console.log('⚠️ Using fallback detection (ML unavailable)');
        
        if (popup) {
            popup.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:24px;">${isHuman ? '✅' : '🚨'}</div>
                    <div style="font-weight:bold;">${isHuman ? 'HUMAN' : 'BOT'} (fallback)</div>
                    <div style="font-size:11px;">ML unavailable, using basic detection</div>
                </div>
            `;
            popup.style.backgroundColor = isHuman ? '#28a745' : '#dc3545';
            popup.style.color = 'white';
            popup.style.padding = '15px';
            popup.style.borderRadius = '8px';
            popup.style.display = 'block';
            setTimeout(() => popup.style.display = 'none', 3000);
        }
        
        if (isHuman) {
            setTimeout(() => form.submit(), 2000);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();