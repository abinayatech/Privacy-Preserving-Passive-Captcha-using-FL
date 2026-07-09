import json
import csv

# Step 1: Create dummy passive data
dummy_data = [
    {"user_id": 1, "mouse_moves": 120, "keypresses": 30, "time_spent": 45},
    {"user_id": 2, "mouse_moves": 80, "keypresses": 20, "time_spent": 30},
    {"user_id": 3, "mouse_moves": 150, "keypresses": 50, "time_spent": 60},
]

# Step 2: Save data as JSON
with open("passive_data/dummy_data.json", "w") as json_file:
    json.dump(dummy_data, json_file, indent=4)
print("✅ Dummy data saved as JSON")

# Step 3: Save data as CSV
csv_file = "passive_data/dummy_data.csv"
with open(csv_file, "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=dummy_data[0].keys())
    writer.writeheader()
    writer.writerows(dummy_data)

print("✅ Dummy data saved as CSV")


