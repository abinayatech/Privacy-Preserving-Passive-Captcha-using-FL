const express = require('express');
const cors = require('cors');
const path = require('path');

// Database imports
const initDatabase = require('./database/init');

// Route imports
const trackingRoutes = require('./routes/tracking');
const aadhaarRoutes = require('./routes/aadhaar');
const analyticsRoutes = require('./routes/analytics'); // ADD THIS LINE

const app = express();
const PORT = 5003;

// Initialize database
initDatabase();

// ✅ DATABASE MONITORING - Add this after database initialization
console.log('📊 Database monitoring activated - watching for new entries...');
console.log('🗂️ Database file: ' + path.join(__dirname, 'database', 'database.db'));
console.log('📈 Tables: user_behavior, contact_messages, aadhaar_attempts, captcha_logs, verification_sessions');
console.log('👀 All form submissions will be logged automatically\n');

// CORS configuration
app.use(cors({
    origin: ["http://localhost:5003", "http://127.0.0.1:5003", "http://localhost:3000"],
    credentials: true
}));

app.use(express.json());

// Serve static files from the correct path (go up one level then into aadhaar--portal)
app.use(express.static(path.join(__dirname, '../aadhaar--portal')));
app.use('/css', express.static(path.join(__dirname, '../aadhaar--portal', 'css')));
app.use('/js', express.static(path.join(__dirname, '../aadhaar--portal', 'js')));
app.use('/assets', express.static(path.join(__dirname, '../aadhaar--portal', 'assets')));

// Logging middleware with enhanced database logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/aadhaar', aadhaarRoutes);
app.use('/api/analytics', analyticsRoutes); // ADD THIS LINE

// Health check with database status
app.get('/api/health', (req, res) => {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'database', 'database.db');
    const db = new sqlite3.Database(dbPath);
    
    // Get database stats
    db.all(`SELECT 
        (SELECT COUNT(*) FROM user_behavior) as behavior_count,
        (SELECT COUNT(*) FROM contact_messages) as contact_count,
        (SELECT COUNT(*) FROM aadhaar_attempts) as aadhaar_count,
        (SELECT COUNT(*) FROM captcha_logs) as captcha_count,
        (SELECT COUNT(*) FROM verification_sessions) as session_count`, 
    (err, rows) => {
        if (err) {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Aadhaar Portal',
                port: PORT,
                database: 'SQLite - Active (Stats unavailable)',
                pages: ['/', '/check-status', '/download', '/update', '/verify', '/contact'],
                features: ['Bot Detection', 'Behavior Tracking', 'Analytics Dashboard', 'Popup Messages']
            });
        } else {
            const stats = rows[0];
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Aadhaar Portal',
                port: PORT,
                database: {
                    status: 'Active',
                    tables: {
                        user_behavior: `${stats.behavior_count} entries`,
                        contact_messages: `${stats.contact_count} entries`,
                        aadhaar_attempts: `${stats.aadhaar_count} entries`,
                        captcha_logs: `${stats.captcha_count} entries`,
                        verification_sessions: `${stats.session_count} entries`
                    }
                },
                pages: ['/', '/check-status', '/download', '/update', '/verify', '/contact'],
                features: ['Bot Detection', 'Behavior Tracking', 'Analytics Dashboard', 'Popup Messages'],
                analytics: 'Available at /api/analytics'
            });
        }
        db.close();
    });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard.html');
    res.sendFile(dashboardPath);
});

// Enhanced HTML serving with popup injection
const serveHTMLWithPopups = (filePath) => {
    return (req, res) => {
        const fullPath = path.join(__dirname, filePath);
        
        // Read the HTML file
        const fs = require('fs');
        fs.readFile(fullPath, 'utf8', (err, html) => {
            if (err) {
                res.status(404).send('Page not found');
                return;
            }

            // Inject popup script before closing body tag
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
<!-- End Auto-injected Popup Handler -->
`;

            // Inject the script before closing body tag
            if (html.includes('</body>')) {
                html = html.replace('</body>', popupScript + '</body>');
            } else {
                html += popupScript;
            }

            res.send(html);
        });
    };
};

// Update all individual page routes with correct paths:
app.get('/', serveHTMLWithPopups('../aadhaar--portal/index.html'));
app.get('/check-status', serveHTMLWithPopups('../aadhaar--portal/check-status.html'));
app.get('/download', serveHTMLWithPopups('../aadhaar--portal/download.html'));
app.get('/update', serveHTMLWithPopups('../aadhaar--portal/update.html'));
app.get('/verify', serveHTMLWithPopups('../aadhaar--portal/verify.html'));
app.get('/contact', serveHTMLWithPopups('../aadhaar--portal/contact.html'));

// Catch-all for SPA routing
app.get('*', (req, res) => {
    if (!req.path.includes('.') || req.path.endsWith('/')) {
        serveHTMLWithPopups('../aadhaar--portal/index.html')(req, res);
    } else {
        res.status(404).json({ 
            success: false,
            popup: {
                message: '❌ Page not found',
                type: 'error',
                autoClose: 5000
            }
        });
    }
});

// Start server
app.listen(PORT, 'localhost', () => {
    console.log(`🚀 Aadhaar Portal Backend with Database Monitoring`);
    console.log(`📍 Frontend: http://localhost:${PORT}`);
    console.log(`📊 Analytics Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📈 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🗂️ Database: SQLite with Behavioral Tracking`);
    console.log(`🤖 Bot Detection: ACTIVE`);
    console.log(`📊 Analytics: ENABLED`);
    console.log(`💬 Popup Messages: ENABLED`);
    console.log(`📈 Behavior Analytics: ACTIVE`);
    console.log(`\n🌐 Available Pages:`);
    console.log(`   📍 Home: http://localhost:${PORT}/`);
    console.log(`   📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`   🔍 Check Status: http://localhost:${PORT}/check-status`);
    console.log(`   📥 Download: http://localhost:${PORT}/download`);
    console.log(`   ✏️ Update: http://localhost:${PORT}/update`);
    console.log(`   ✅ Verify: http://localhost:${PORT}/verify`);
    console.log(`   📞 Contact: http://localhost:${PORT}/contact`);
    console.log(`\n🔧 API Endpoints:`);
    console.log(`   ❤️ Health: http://localhost:${PORT}/api/health`);
    console.log(`   📊 Tracking: http://localhost:${PORT}/api/tracking/save`);
    console.log(`   📈 Analytics: http://localhost:${PORT}/api/analytics/overview`);
    console.log(`   🔍 Aadhaar: http://localhost:${PORT}/api/aadhaar/check-status`);
    console.log(`\n📊 DATABASE MONITORING ACTIVE:`);
    console.log(`   👀 Watching for new entries in real-time`);
    console.log(`   💾 All form data automatically stored`);
    console.log(`   🤖 Bot detection results logged`);
    console.log(`   📊 Analytics data available via API`);
    console.log(`\n✅ Server started successfully at ${new Date().toISOString()}`);
});