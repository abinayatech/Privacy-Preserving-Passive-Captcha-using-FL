// check_database.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("federated_captcha.db");

console.log("🔍 Checking database tables...\n");

// List all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.log("❌ Error:", err.message);
        db.close();
        return;
    }
    
    if (tables.length === 0) {
        console.log("📭 No tables found in database.");
        db.close();
        return;
    }
    
    console.log("📊 Tables found:");
    
    // Check each table
    let completed = 0;
    tables.forEach((table) => {
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
            if (err) {
                console.log(`   ❌ ${table.name}: Error - ${err.message}`);
            } else {
                console.log(`   ✅ ${table.name}: ${result.count} rows`);
            }
            
            completed++;
            if (completed === tables.length) {
                console.log("\n🎉 Database check completed!");
                db.close();
            }
        });
    });
});
