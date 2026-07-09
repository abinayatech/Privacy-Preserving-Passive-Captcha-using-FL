// check-database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend', 'database', 'database.db');
console.log('📊 Checking database at:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to SQLite database');
});

// Function to check all tables
function checkAllTables() {
    console.log('\n📋 DATABASE CONTENTS:');
    console.log('=' .repeat(50));
    
    // Check user_behavior table
    db.all("SELECT * FROM user_behavior ORDER BY timestamp DESC LIMIT 10", (err, rows) => {
        if (err) {
            console.log('❌ user_behavior table error:', err.message);
        } else {
            console.log('\n👤 USER_BEHAVIOR TABLE (Latest 10 entries):');
            console.log('-'.repeat(50));
            if (rows.length === 0) {
                console.log('   No entries found');
            } else {
                rows.forEach((row, index) => {
                    console.log(`   ${index + 1}. ID: ${row.id} | Session: ${row.session_id}`);
                    console.log(`      Mouse Moves: ${row.mouse_moves} | Distance: ${row.total_distance}`);
                    console.log(`      Scrolls: ${row.scrolls} | Focus Switches: ${row.focus_switches}`);
                    console.log(`      Key Interval: ${row.avg_key_interval} | Confidence: ${row.detection_confidence}`);
                    console.log(`      Label: ${row.label} | Bot Score: ${row.bot_score}`);
                    console.log(`      Page: ${row.page_visited} | Time: ${row.timestamp}`);
                    console.log('      ' + '-'.repeat(30));
                });
            }
        }
        
        // Check contact_messages table
        db.all("SELECT * FROM contact_messages ORDER BY timestamp DESC LIMIT 5", (err, rows) => {
            if (err) {
                console.log('❌ contact_messages table error:', err.message);
            } else {
                console.log('\n📞 CONTACT_MESSAGES TABLE (Latest 5 entries):');
                console.log('-'.repeat(50));
                if (rows.length === 0) {
                    console.log('   No entries found');
                } else {
                    rows.forEach((row, index) => {
                        console.log(`   ${index + 1}. ID: ${row.id} | Name: ${row.name}`);
                        console.log(`      Email: ${row.email}`);
                        console.log(`      Message: ${row.message.substring(0, 50)}${row.message.length > 50 ? '...' : ''}`);
                        console.log(`      Time: ${row.timestamp}`);
                        console.log('      ' + '-'.repeat(30));
                    });
                }
            }
            
            // Check aadhaar_attempts table
            db.all("SELECT * FROM aadhaar_attempts ORDER BY timestamp DESC LIMIT 5", (err, rows) => {
                if (err) {
                    console.log('❌ aadhaar_attempts table error:', err.message);
                } else {
                    console.log('\n🔍 AADHAAR_ATTEMPTS TABLE (Latest 5 entries):');
                    console.log('-'.repeat(50));
                    if (rows.length === 0) {
                        console.log('   No entries found');
                    } else {
                        rows.forEach((row, index) => {
                            console.log(`   ${index + 1}. ID: ${row.id} | Type: ${row.request_type}`);
                            console.log(`      Aadhaar: ${row.aadhaar_number} | Status: ${row.status}`);
                            console.log(`      Risk Score: ${row.risk_score} | Session: ${row.session_id}`);
                            console.log(`      Time: ${row.timestamp}`);
                            console.log('      ' + '-'.repeat(30));
                        });
                    }
                }
                
                // Show statistics
                showStatistics();
            });
        });
    });
}

// Function to show statistics
function showStatistics() {
    console.log('\n📈 DATABASE STATISTICS:');
    console.log('-'.repeat(50));
    
    db.get(`SELECT 
        COUNT(*) as total_entries,
        SUM(CASE WHEN label = 'human' THEN 1 ELSE 0 END) as human_count,
        SUM(CASE WHEN label = 'bot' THEN 1 ELSE 0 END) as bot_count,
        AVG(detection_confidence) as avg_confidence
    FROM user_behavior`, (err, row) => {
        if (err) {
            console.log('❌ Statistics error:', err.message);
        } else {
            console.log(`   Total Behavior Entries: ${row.total_entries}`);
            console.log(`   Human Interactions: ${row.human_count}`);
            console.log(`   Bot Detections: ${row.bot_count}`);
            console.log(`   Average Confidence: ${row.avg_confidence ? parseFloat(row.avg_confidence).toFixed(4) : 'N/A'}`);
            
            if (row.total_entries > 0) {
                const botRate = ((row.bot_count / row.total_entries) * 100).toFixed(2);
                console.log(`   Bot Detection Rate: ${botRate}%`);
            }
        }
        
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('❌ Database close error:', err.message);
            } else {
                console.log('\n✅ Database connection closed');
            }
        });
    });
}

// Start checking
checkAllTables();