print("=== ML TEST START ===")

import sys
import os
import json

# Simple test
test_data = {
    'mouseMoves': 25,
    'totalDistance': 1500.0,
    'avgKeyInterval': 200,
    'scrolls': 4,
    'focusSwitches': 1
}

print(f"Test data: {test_data}")
print(json.dumps({"test": "working", "data": test_data}))

print("=== ML TEST END ===")