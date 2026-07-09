const fs = require('fs');
const path = require('path');

// Middleware to inject popup handling into HTML responses
function injectPopupHandler(req, res, next) {
    const originalSend = res.send;
    
    res.send = function (body) {
        if (typeof body === 'string' && res.get('Content-Type')?.includes('text/html')) {
            const popupScript = `
<!-- Auto-injected Popup Handler -->
<script>
function showBackendPopup(popupData) {
    if (!popupData) return;
    
    const popup = document.createElement('div');
    popup.className = 'backend-popup backend-popup-' + (popupData.type || 'info');
    popup.innerHTML = \`
        <div class="backend-popup-content">
            <span class="backend-popup-message">\${popupData.message || 'Notification'}</span>
            <button class="backend-popup-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    \`;
    
    popup.style.cssText = \`
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: backendSlideIn 0.3s ease-out;
        max-width: 400px;
        border-left: 4px solid;
    \`;
    
    const styles = {
        success: { background: '#28a745', borderColor: '#1e7e34' },
        error: { background: '#dc3545', borderColor: '#c82333' },
        warning: { background: '#ffc107', color: '#212529', borderColor: '#e0a800' },
        info: { background: '#17a2b8', borderColor: '#138496' }
    };
    
    Object.assign(popup.style, styles[popupData.type] || styles.info);
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentElement) {
            popup.style.animation = 'backendSlideOut 0.3s ease-in forwards';
            setTimeout(() => popup.parentElement?.removeChild(popup), 300);
        }
    }, popupData.autoClose || 5000);
}

const style = document.createElement('style');
style.textContent = \`
    @keyframes backendSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes backendSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .backend-popup-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 18px;
        margin-left: 10px;
        opacity: 0.8;
    }
    .backend-popup-close:hover { opacity: 1; }
\`;
document.head.appendChild(style);

const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
        if (response.ok) {
            return response.clone().json().then(data => {
                if (data && data.popup) {
                    setTimeout(() => showBackendPopup(data.popup), 100);
                }
                return response;
            }).catch(() => response);
        }
        return response;
    });
};

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => { submitBtn.disabled = false; }, 2000);
            }
        });
    });
});
</script>
`;

            if (body.includes('</body>')) {
                body = body.replace('</body>', popupScript + '</body>');
            } else {
                body += popupScript;
            }
        }
        
        originalSend.call(this, body);
    };
    
    next();
}

module.exports = injectPopupHandler;