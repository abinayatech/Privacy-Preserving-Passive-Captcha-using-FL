import requests
import json
import time
import random
from datetime import datetime

print("=== FL-CAPTCHA Correct Simulation ===")
print("Using actual Flask server endpoints...")

# Store client IDs
clients = []

# 1. Add clients using CORRECT endpoint
print("\n1. Adding clients via /api/add-client...")
for i in range(1, 3):
    client_data = {
        "client_id": f"sim_client_{i}",
        "samples": 256,
        "model_version": 1
    }
    
    try:
        response = requests.post("http://localhost:5000/api/add-client", 
                               json=client_data, timeout=5)
        print(f"   Response {i}: Status {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Result: {result}")
            clients.append(f"sim_client_{i}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

print(f"\nRegistered clients: {clients}")

# 2. Simulate predictions using CORRECT endpoint
print("\n2. Simulating predictions via /api/simulate-prediction...")
prediction_types = [
    {"is_human": 1, "confidence": 0.85},
    {"is_human": 1, "confidence": 0.78},
    {"is_human": 0, "confidence": 0.92},
    {"is_human": 0, "confidence": 0.87},
    {"is_human": 1, "confidence": 0.95}
]

for i, pred in enumerate(prediction_types):
    for client_id in clients:
        prediction_data = {
            "client_id": client_id,
            **pred  # Add is_human and confidence
        }
        
        try:
            response = requests.post("http://localhost:5000/api/simulate-prediction",
                                   json=prediction_data, timeout=5)
            print(f"   Prediction {i+1} from {client_id}: Status {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                label = "Human" if pred["is_human"] else "Bot"
                print(f"     → {label} detected ({pred['confidence']:.0%} confidence)")
        except Exception as e:
            print(f"   Error: {e}")
        
        time.sleep(0.5)

# 3. Start FL round using CORRECT endpoint
print("\n3. Starting FL round via /api/start-fl-round...")
fl_data = {
    "min_clients": 2,
    "force": True
}

try:
    response = requests.post("http://localhost:5000/api/start-fl-round", 
                           json=fl_data, timeout=10)
    print(f"   FL Round Start: Status {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Result: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

# 4. Check dashboard stats
print("\n4. Checking dashboard stats...")
try:
    response = requests.get("http://localhost:5000/api/dashboard-stats", timeout=5)
    if response.status_code == 200:
        stats = response.json()
        print("\n📊 CURRENT DASHBOARD STATS:")
        print("=" * 50)
        print(f"   Active Clients: {stats.get('active_clients', 0)}")
        print(f"   Total Predictions: {stats.get('total_predictions', 0)}")
        print(f"   Correct Predictions: {stats.get('correct_predictions', 0)}")
        print(f"   Global Accuracy: {stats.get('global_accuracy', 0)*100:.1f}%")
        print(f"   Bot Detection Rate: {stats.get('bot_detection_rate', 0)*100:.1f}%")
        print(f"   FL Round: {stats.get('fl_round', 0)}")
        print(f"   FL Status: {stats.get('fl_status', 'Unknown')}")
        print("=" * 50)
        
        if stats.get('total_predictions', 0) > 0:
            print("\n✅ SUCCESS! Dashboard should now show real data!")
        else:
            print("\n⚠️  Still no predictions. Trying direct database insert...")
except Exception as e:
    print(f"   Error getting stats: {e}")

print("\nSimulation complete!")
print("Open dashboard: http://localhost:5000/dashboard")
