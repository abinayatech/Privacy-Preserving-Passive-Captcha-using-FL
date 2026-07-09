# test_real_database.py
import sqlite3
import requests
import time

print("=" * 60)
print("🔍 TESTING REAL DATABASE CONNECTION")
print("=" * 60)

# 1. Check database directly
conn = sqlite3.connect("federated_captcha.db")
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*), SUM(correct) FROM predictions")
total, correct = cursor.fetchone()
total = total or 0
correct = correct or 0
accuracy = (correct / total * 100) if total > 0 else 0

print(f"📊 DIRECT DATABASE QUERY:")
print(f"   Total predictions: {total}")
print(f"   Correct predictions: {correct}")
print(f"   Accuracy: {accuracy:.2f}%")

if total == 0:
    print(f"\n⚠️  WARNING: Database has 0 predictions!")
    print(f"   But earlier we saw 8 predictions with 62.5% accuracy")
    print(f"   Checking if we're using wrong database file...")
    
    # List all .db files
    import os
    db_files = [f for f in os.listdir(".") if f.endswith(".db")]
    print(f"   Found database files: {db_files}")
    
    # Check each one
    for db_file in db_files:
        try:
            conn2 = sqlite3.connect(db_file)
            cursor2 = conn2.cursor()
            cursor2.execute("SELECT COUNT(*) FROM predictions")
            count = cursor2.fetchone()[0]
            print(f"   {db_file}: {count} predictions")
            conn2.close()
        except:
            print(f"   {db_file}: No predictions table")

cursor.close()
conn.close()

print("\n" + "=" * 60)
print("🌐 TESTING FLASK API RESPONSE")
print("=" * 60)

# 2. Test Flask API
time.sleep(2)  # Wait for server

try:
    response = requests.get("http://localhost:5000/api/dashboard-stats", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ API Response:")
        print(f"   Status: {data.get('data_status', 'Unknown')}")
        print(f"   Accuracy: {data.get('global_accuracy', 0)}%")
        print(f"   Total predictions: {data.get('total_predictions', 0)}")
        print(f"   Correct predictions: {data.get('correct_predictions', 0)}")
        
        # Compare
        if data.get('total_predictions', 0) == total:
            print(f"\n🎉 PERFECT MATCH! API is using real database!")
        else:
            print(f"\n⚠️  MISMATCH: API shows {data.get('total_predictions', 0)} predictions, Database has {total}")
    else:
        print(f"❌ API Error: Status {response.status_code}")
        
except Exception as e:
    print(f"❌ API Connection failed: {e}")
