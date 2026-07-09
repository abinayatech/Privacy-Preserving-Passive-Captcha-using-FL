import sqlite3
import json
import os
from datetime import datetime

print("=== FL-CAPTCHA Diagnostic ===")
print(f"Time: {datetime.now()}")
print(f"Directory: {os.getcwd()}")

# 1. Check Database
print("\n1. Database Analysis:")
db_path = "federated_captcha.db"
if os.path.exists(db_path):
    print(f"   Database found: {os.path.getsize(db_path)/1024:.1f} KB")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"   Tables found ({len(tables)}):")
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"     - {table_name}: {count} rows")
            
            # Show first few columns if it's predictions table
            if table_name == "predictions":
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                print(f"       Columns: {[col[1] for col in columns]}")
                
                # Show some recent data
                cursor.execute(f"SELECT * FROM {table_name} ORDER BY timestamp DESC LIMIT 3")
                recent = cursor.fetchall()
                if recent:
                    print(f"       Recent entries:")
                    for row in recent:
                        print(f"         {row}")
        
        conn.close()
    except Exception as e:
        print(f"   Error reading database: {e}")
else:
    print("   Database NOT FOUND!")

# 2. Check Flask Server
print("\n2. Flask Server Check:")
try:
    import requests
    try:
        response = requests.get("http://localhost:5000/", timeout=3)
        print(f"   Flask server: RUNNING (Status {response.status_code})")
    except requests.ConnectionError:
        print("   Flask server: NOT RUNNING (Connection refused)")
    except Exception as e:
        print(f"   Flask server check error: {e}")
except ImportError:
    print("   Requests module not installed. Run: pip install requests")

# 3. Check Directories
print("\n3. Directory Structure:")
dirs_to_check = ["federated_model", "federated_logs", "fl-captcha-dashboard", "client_updates"]
for dir_name in dirs_to_check:
    if os.path.exists(dir_name):
        items = os.listdir(dir_name)
        print(f"   {dir_name}: {len(items)} items")
        if items:
            # Show first few items
            for item in items[:3]:
                print(f"     - {item}")
            if len(items) > 3:
                print(f"     ... and {len(items)-3} more")
    else:
        print(f"   {dir_name}: NOT FOUND")

# 4. Check Model Files
print("\n4. Model Status:")
model_dir = "federated_model"
if os.path.exists(model_dir):
    model_files = [f for f in os.listdir(model_dir) if f.endswith(('.pkl', '.h5', '.keras', '.pt'))]
    print(f"   Model files: {len(model_files)}")
    for model_file in model_files[:5]:
        file_path = os.path.join(model_dir, model_file)
        size_kb = os.path.getsize(file_path) / 1024
        print(f"     - {model_file} ({size_kb:.1f} KB)")
else:
    print("   Model directory not found!")

print("\n=== Diagnostic Complete ===")
