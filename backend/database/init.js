const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

function initDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
        } else {
            console.log('✅ Connected to SQLite database');
            createTables(db);
        }
    });
    return db;
}

function createTables(db) {
    // Drop and recreate tables to fix schema (only in development)
    db.run(`DROP TABLE IF EXISTS user_behavior`);
    db.run(`DROP TABLE IF EXISTS contact_messages`);
    db.run(`DROP TABLE IF EXISTS aadhaar_attempts`);
    db.run(`DROP TABLE IF EXISTS captcha_logs`);
    db.run(`DROP TABLE IF EXISTS verification_sessions`);

    // User behavior tracking table - UPDATED FOR PROGRESSIVE CAPTCHA
    db.run(`CREATE TABLE IF NOT EXISTS user_behavior (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Basic behavior metrics
        mouse_moves INTEGER DEFAULT 0,
        total_distance REAL DEFAULT 0,
        avg_key_interval REAL DEFAULT 0,
        scrolls INTEGER DEFAULT 0,
        focus_switches INTEGER DEFAULT 0,
        
        -- ML detection results
        label TEXT DEFAULT 'human',
        detection_confidence REAL DEFAULT 0.9,
        bot_score REAL DEFAULT 0,
        human_score REAL DEFAULT 0,
        
        -- Progressive CAPTCHA fields
        captcha_required BOOLEAN DEFAULT 0,
        verification_status TEXT DEFAULT 'pending', -- 'pending', 'allowed', 'blocked', 'captcha_shown', 'captcha_passed', 'captcha_failed'
        captcha_shown_at DATETIME,
        captcha_passed_at DATETIME,
        captcha_type TEXT, -- 'checkbox', 'image', 'calculation', etc.
        
        -- Context information
        page_visited TEXT DEFAULT 'unknown',
        form_type TEXT, -- 'check_status', 'download', 'update', 'verify', 'contact'
        user_agent TEXT,
        ip_address TEXT,
        
        -- Session information
        duration_seconds INTEGER DEFAULT 0,
        final_action TEXT, -- 'allow', 'block', 'captcha_required'
        ml_decision TEXT, -- 'high_confidence_human', 'high_confidence_bot', 'uncertain'
        
        -- Performance metrics
        ml_processing_time_ms INTEGER,
        total_verification_time_ms INTEGER,
        
        -- Indexes for faster queries
        UNIQUE(session_id)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating user_behavior table:', err.message);
        } else {
            console.log('✅ Created user_behavior table with CAPTCHA tracking');
        }
    });

    // Aadhaar verification attempts table
    db.run(`CREATE TABLE IF NOT EXISTS aadhaar_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Aadhaar information
        aadhaar_number TEXT,
        request_type TEXT, -- 'check_status', 'download', 'update', 'verify'
        status TEXT, -- 'success', 'failed', 'pending'
        
        -- Security information
        session_id TEXT,
        risk_score REAL DEFAULT 0,
        verification_method TEXT, -- 'ml_only', 'ml_with_captcha', 'manual'
        captcha_used BOOLEAN DEFAULT 0,
        
        -- User information
        user_ip TEXT,
        user_agent TEXT,
        page_referrer TEXT,
        
        -- Result information
        result_code TEXT,
        result_message TEXT,
        processing_time_ms INTEGER,
        
        -- Foreign key to user_behavior
        behavior_id INTEGER,
        FOREIGN KEY (behavior_id) REFERENCES user_behavior(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating aadhaar_attempts table:', err.message);
        } else {
            console.log('✅ Created aadhaar_attempts table');
        }
    });

    // Contact messages table
    db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Contact information
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        
        -- Security tracking
        session_id TEXT,
        verification_status TEXT DEFAULT 'pending', -- 'verified', 'unverified', 'suspicious'
        captcha_passed BOOLEAN DEFAULT 0,
        
        -- ML analysis results
        spam_score REAL DEFAULT 0,
        risk_level TEXT, -- 'low', 'medium', 'high'
        ml_verdict TEXT, -- 'human', 'bot', 'uncertain'
        
        -- Processing information
        processed BOOLEAN DEFAULT 0,
        processed_at DATETIME,
        admin_notes TEXT,
        
        -- Foreign key to user_behavior
        behavior_id INTEGER,
        FOREIGN KEY (behavior_id) REFERENCES user_behavior(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating contact_messages table:', err.message);
        } else {
            console.log('✅ Created contact_messages table');
        }
    });

    // CAPTCHA logs table - Detailed tracking of CAPTCHA interactions
    db.run(`CREATE TABLE IF NOT EXISTS captcha_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Session information
        session_id TEXT NOT NULL,
        page_url TEXT,
        form_type TEXT,
        
        -- CAPTCHA details
        captcha_type TEXT NOT NULL, -- 'checkbox', 'image_selection', 'calculation', 'invisible'
        captcha_challenge TEXT,
        captcha_response TEXT,
        
        -- User interaction
        interaction_time_ms INTEGER, -- Time user took to solve CAPTCHA
        attempts INTEGER DEFAULT 1,
        success BOOLEAN DEFAULT 0,
        
        -- Confidence levels before/after CAPTCHA
        confidence_before REAL, -- ML confidence before CAPTCHA
        confidence_after REAL,  -- ML confidence after CAPTCHA (if applicable)
        
        -- Result
        result TEXT, -- 'passed', 'failed', 'timeout', 'skipped'
        failure_reason TEXT,
        
        -- Metadata
        user_agent TEXT,
        ip_address TEXT,
        
        -- Foreign keys
        behavior_id INTEGER,
        aadhaar_attempt_id INTEGER,
        FOREIGN KEY (behavior_id) REFERENCES user_behavior(id) ON DELETE SET NULL,
        FOREIGN KEY (aadhaar_attempt_id) REFERENCES aadhaar_attempts(id) ON DELETE SET NULL
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating captcha_logs table:', err.message);
        } else {
            console.log('✅ Created captcha_logs table');
        }
    });

    // Verification sessions table - For tracking complete user sessions
    db.run(`CREATE TABLE IF NOT EXISTS verification_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL UNIQUE,
        
        -- Session timing
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        duration_seconds INTEGER,
        
        -- User information
        ip_address TEXT,
        user_agent TEXT,
        device_fingerprint TEXT,
        
        -- Pages visited in this session
        pages_visited TEXT, -- JSON array of page URLs
        forms_submitted TEXT, -- JSON array of form types submitted
        
        -- Overall verification results
        overall_verdict TEXT, -- 'verified_human', 'suspicious', 'blocked_bot'
        ml_confidence_avg REAL,
        captcha_required_count INTEGER DEFAULT 0,
        captcha_passed_count INTEGER DEFAULT 0,
        
        -- Risk assessment
        risk_score REAL DEFAULT 0,
        risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
        flags TEXT, -- JSON array of risk flags
        
        -- Performance metrics
        avg_ml_processing_time_ms INTEGER,
        avg_captcha_solve_time_ms INTEGER,
        
        -- Final status
        status TEXT DEFAULT 'active', -- 'active', 'completed', 'blocked', 'suspended'
        block_reason TEXT,
        
        -- Indexes
        INDEX idx_session_started (started_at),
        INDEX idx_session_status (status),
        INDEX idx_session_risk (risk_level)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating verification_sessions table:', err.message);
        } else {
            console.log('✅ Created verification_sessions table');
        }
    });

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_behavior_session ON user_behavior(session_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_behavior_status ON user_behavior(verification_status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_behavior_label ON user_behavior(label)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_aadhaar_timestamp ON aadhaar_attempts(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_aadhaar_status ON aadhaar_attempts(status)`);
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_captcha_session ON captcha_logs(session_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_captcha_timestamp ON captcha_logs(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_captcha_success ON captcha_logs(success)`);
    
    console.log('✅ Database tables recreated with CAPTCHA tracking schema');
    
    // Create a view for analytics
    db.run(`
        CREATE VIEW IF NOT EXISTS verification_analytics AS
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as total_attempts,
            SUM(CASE WHEN label = 'human' THEN 1 ELSE 0 END) as human_count,
            SUM(CASE WHEN label = 'bot' THEN 1 ELSE 0 END) as bot_count,
            SUM(CASE WHEN captcha_required = 1 THEN 1 ELSE 0 END) as captcha_required_count,
            SUM(CASE WHEN verification_status = 'captcha_passed' THEN 1 ELSE 0 END) as captcha_passed_count,
            AVG(detection_confidence) as avg_confidence,
            AVG(duration_seconds) as avg_duration
        FROM user_behavior
        GROUP BY DATE(timestamp)
    `, (err) => {
        if (err) {
            console.error('❌ Error creating analytics view:', err.message);
        } else {
            console.log('✅ Created verification_analytics view');
        }
    });
}

module.exports = initDatabase;