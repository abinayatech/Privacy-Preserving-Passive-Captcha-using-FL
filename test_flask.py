import requests
try:
    r = requests.get("http://localhost:5000/health", timeout=3)
    print(f"✅ Flask Status: {r.status_code}")
    data = r.json()
    print(f"Server: {data.get('server', 'Unknown')}")
    print(f"Status: {data.get('status', 'Unknown')}")
    print(f"Model: {data.get('model', 'Unknown')}")
except Exception as e:
    print(f"❌ Error: {e}")
    print("Flask server is NOT running!")
    print("Run in another window: python flask_server.py")
