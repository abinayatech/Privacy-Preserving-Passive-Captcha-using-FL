import requests
import json
import time
import random
from datetime import datetime

print("=== FL-CAPTCHA Client Simulation ===")
print("Connecting 2 clients with 256 samples each...")

# 1. Register two clients
clients = []
for i in range(1, 3):
    client_id = f"sim_client_{i}"
    client_data = {
        "client_id": client_id,
        "samples": 256,
        "model_version": 1,
        "features": [random.random() for _ in range(5)]  # 5 features
    }
    
    try:
        # Register client
        response = requests.post("http://localhost:5000/api/register-client", 
                               json=client_data, timeout=5)
        if response.status_code in [200, 201]:
            print(f"✓ Client {i} registered: {client_id}")
            clients.append(client_id)
        else:
            print(f"✗ Client {i} failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Client {i} error: {e}")

print(f"\n{len(clients)} clients registered")

# 2. Send client updates (simulate local training)
print("\nSending client updates...")
for client_id in clients:
    update_data = {
        "client_id": client_id,
        "round_number": 1,
        "samples_count": 256,
        "update_data": {
            "weights": [random.random() for _ in range(10)],
            "accuracy": random.uniform(0.7, 0.9),
            "predictions": 50
        }
    }
    
    try:
        response = requests.post("http://localhost:5000/api/submit-update", 
                               json=update_data, timeout=5)
        print(f"✓ Update from {client_id}: {response.status_code}")
    except Exception as e:
        print(f"✗ Update error for {client_id}: {e}")

# 3. Simulate predictions (this populates the dashboard)
print("\nSimulating predictions...")
prediction_types = [
    (1, 0.85),  # Human prediction with 85% confidence
    (1, 0.78),  # Human prediction with 78% confidence  
    (0, 0.92),  # Bot prediction with 92% confidence
    (0, 0.87),  # Bot prediction with 87% confidence
    (1, 0.95),  # Human prediction with 95% confidence
]

for i, (is_human, confidence) in enumerate(prediction_types):
    for client_id in clients:
        prediction = {
            "client_id": client_id,
            "is_human": is_human,
            "confidence": confidence,
            "features": [random.random() for _ in range(5)],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post("http://localhost:5000/api/log-prediction",
                                   json=prediction, timeout=5)
            if response.status_code == 200:
                result = response.json()
                label = "Human" if is_human else "Bot"
                print(f"✓ Prediction {i+1} from {client_id}: {label} ({confidence:.0%})")
        except Exception as e:
            print(f"✗ Prediction error: {e}")
        
        time.sleep(0.3)  # Small delay

# 4. Manually start FL round (since we have clients)
print("\nStarting Federated Learning round...")
fl_data = {
    "min_clients": 2,
    "round_number": 1,
    "force": True
}

try:
    response = requests.post("http://localhost:5000/federated/aggregate", 
                           json=fl_data, timeout=10)
    print(f"FL Round Start: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Result: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"FL Round error: {e}")

# 5. Check final status
print("\n" + "="*50)
print("Checking final dashboard status...")
try:
    response = requests.get("http://localhost:5000/api/dashboard-stats", timeout=5)
    if response.status_code == 200:
        stats = response.json()
        print("\n📊 FINAL DASHBOARD STATS:")
        print(f"   Active Clients: {stats.get('active_clients', 0)}")
        print(f"   Total Predictions: {stats.get('total_predictions', 0)}")
        print(f"   Correct Predictions: {stats.get('correct_predictions', 0)}")
        print(f"   Global Accuracy: {stats.get('global_accuracy', 0)*100:.1f}%")
        print(f"   Bot Detection Rate: {stats.get('bot_detection_rate', 0)*100:.1f}%")
        print(f"   FL Round: {stats.get('fl_round', 0)}")
        print(f"   FL Status: {stats.get('fl_status', 'Unknown')}")
        
        if stats.get('total_predictions', 0) > 0:
            print(f"\n✅ SUCCESS: Dashboard now has {stats['total_predictions']} predictions!")
        else:
            print(f"\n❌ Still no predictions. Checking alternative endpoints...")
except Exception as e:
    print(f"Error getting final stats: {e}")

print("\nSimulation complete! Refresh your dashboard.")
print("Dashboard URL: http://localhost:5000/dashboard")
