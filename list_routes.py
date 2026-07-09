from flask_server import app

print("Available Flask routes:")
print("=" * 50)

for rule in app.url_map.iter_rules():
    methods = ','.join(sorted(rule.methods))
    print(f"{rule.endpoint:30} {methods:20} {rule.rule}")

print("\n" + "=" * 50)
print(f"Total routes: {len(list(app.url_map.iter_rules()))}")
print("\nKey dashboard endpoints to check:")
print("  /dashboard                   - Main dashboard page")
print("  /api/dashboard-stats         - Dashboard JSON data")
print("  /api/register-client         - Register a client")
print("  /api/log-prediction          - Log a prediction")
print("  /federated/aggregate         - Start FL round")
print("  /federated/status            - FL status")
