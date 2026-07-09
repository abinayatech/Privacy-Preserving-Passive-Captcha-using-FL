const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const BehaviorModel = {
    saveTracking: (trackingData) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO user_behavior (
                session_id, mouse_moves, total_distance, avg_key_interval, 
                scrolls, focus_switches, label, detection_confidence, 
                bot_score, human_score, page_visited, duration_seconds,
                captcha_required, verification_status, form_type,
                user_agent, final_action, ml_decision, ml_processing_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                trackingData.session_id,
                trackingData.mouse_moves,
                trackingData.total_distance,
                trackingData.avg_key_interval,
                trackingData.scrolls,
                trackingData.focus_switches,
                trackingData.label,
                trackingData.detection_confidence,
                trackingData.bot_score || (trackingData.label === 'bot' ? trackingData.detection_confidence : 0),
                trackingData.human_score || (trackingData.label === 'human' ? trackingData.detection_confidence : 0),
                trackingData.page_visited || 'unknown',
                trackingData.duration_seconds || 30,
                trackingData.captcha_required || 0,
                trackingData.verification_status || 'pending',
                trackingData.form_type || 'unknown',
                trackingData.user_agent || '',
                trackingData.final_action || 'pending',
                trackingData.ml_decision || 'uncertain',
                trackingData.ml_processing_time_ms || 0
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Database error:', err);
                    reject(err);
                } else {
                    console.log('✅ Behavior data saved to database - ID:', this.lastID);
                    resolve({ id: this.lastID, session_id: trackingData.session_id });
                }
            });
        });
    },

    updateVerificationStatus: (sessionId, status, captchaPassed = false) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE user_behavior 
                        SET verification_status = ?, 
                            captcha_passed = ?,
                            captcha_passed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
                        WHERE session_id = ?`;
            
            db.run(sql, [status, captchaPassed ? 1 : 0, captchaPassed ? 1 : 0, sessionId], function(err) {
                if (err) {
                    console.error('❌ Update error:', err);
                    reject(err);
                } else {
                    console.log(`✅ Updated verification status for ${sessionId}: ${status}`);
                    resolve({ affected: this.changes });
                }
            });
        });
    },

    getSessionStats: (sessionId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM user_behavior WHERE session_id = ?`;
            db.get(sql, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Analytics methods
    getDailyStats: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM verification_analytics ORDER BY date DESC LIMIT 7`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const ContactModel = {
    saveContact: (contactData) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO contact_messages (
                name, email, message, session_id, 
                verification_status, captcha_passed, spam_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, [
                contactData.name,
                contactData.email,
                contactData.message,
                contactData.session_id,
                contactData.verification_status || 'pending',
                contactData.captcha_passed || 0,
                contactData.spam_score || 0
            ], function(err) {
                if (err) {
                    console.error('❌ Contact save error:', err);
                    reject(err);
                } else {
                    console.log('✅ Contact message saved to database');
                    resolve({ contact_id: this.lastID });
                }
            });
        });
    }
};

const CaptchaModel = {
    logCaptchaAttempt: (captchaData) => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO captcha_logs (
                session_id, page_url, form_type, captcha_type,
                captcha_challenge, captcha_response, interaction_time_ms,
                attempts, success, confidence_before, confidence_after,
                result, user_agent, ip_address, behavior_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, [
                captchaData.session_id,
                captchaData.page_url,
                captchaData.form_type,
                captchaData.captcha_type,
                captchaData.captcha_challenge,
                captchaData.captcha_response,
                captchaData.interaction_time_ms,
                captchaData.attempts || 1,
                captchaData.success ? 1 : 0,
                captchaData.confidence_before,
                captchaData.confidence_after,
                captchaData.result,
                captchaData.user_agent,
                captchaData.ip_address,
                captchaData.behavior_id
            ], function(err) {
                if (err) {
                    console.error('❌ Captcha log error:', err);
                    reject(err);
                } else {
                    console.log('✅ Captcha attempt logged');
                    resolve({ captcha_log_id: this.lastID });
                }
            });
        });
    },

    getCaptchaStats: (days = 7) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    captcha_type,
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_attempts,
                    AVG(interaction_time_ms) as avg_solve_time,
                    DATE(timestamp) as date
                FROM captcha_logs
                WHERE timestamp >= DATE('now', ? || ' days')
                GROUP BY captcha_type, DATE(timestamp)
                ORDER BY date DESC, captcha_type
            `;
            
            db.all(sql, [`-${days}`], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { BehaviorModel, ContactModel, CaptchaModel };