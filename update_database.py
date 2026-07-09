# update_database.py - Add attack detection columns to existing database
import sqlite3

print("🔧 UPDATING DATABASE SCHEMA")
print("=" * 50)

# Connect to database
conn = sqlite3.connect('federated_captcha.db')
cursor = conn.cursor()

# Check current tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("📊 Current tables:", [t[0] for t in tables])

# Add is_attack column to predictions table
try:
    cursor.execute("ALTER TABLE predictions ADD COLUMN is_attack INTEGER DEFAULT 0")
    print("✅ Added is_attack column to predictions table")
except sqlite3.OperationalError as e:
    print("⚠️ is_attack column may already exist:", e)

# Add attack_detections column to model_state table
try:
    cursor.execute("ALTER TABLE model_state ADD COLUMN attack_detections INTEGER DEFAULT 0")
    print("✅ Added attack_detections column to model_state table")
except sqlite3.OperationalError as e:
    print("⚠️ attack_detections column may already exist:", e)

# Verify columns were added
print("\n🔍 Verifying predictions table columns:")
cursor.execute("PRAGMA table_info(predictions)")
columns = cursor.fetchall()
for col in columns:
    print(f"   {col[1]} - {col[2]}")

print("\n🔍 Verifying model_state table columns:")
cursor.execute("PRAGMA table_info(model_state)")
columns = cursor.fetchall()
for col in columns:
    print(f"   {col[1]} - {col[2]}")

# Update model_state with attack_detections if it was added
try:
    cursor.execute("UPDATE model_state SET attack_detections = 0 WHERE attack_detections IS NULL")
    conn.commit()
    print("✅ Initialized attack_detections to 0")
except:
    pass

conn.close()
print("\n✅ Database update complete!")