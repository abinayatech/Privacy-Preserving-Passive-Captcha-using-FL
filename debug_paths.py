# debug_paths.py
import os

print("🔍 DEBUGGING FILE PATHS")
print("="*50)

# Current directory
current_dir = os.getcwd()
print(f"Current directory: {current_dir}")
print(f"Directory exists: {os.path.exists(current_dir)}")

# Check aadhaar-portal
aadhaar_path = os.path.join(current_dir, 'aadhaar-portal')
print(f"\naadhaar-portal path: {aadhaar_path}")
print(f"aadhaar-portal exists: {os.path.exists(aadhaar_path)}")

if os.path.exists(aadhaar_path):
    print("Files in aadhaar-portal:")
    for file in os.listdir(aadhaar_path):
        print(f"  - {file}")

# Check verify.html
verify_path = os.path.join(aadhaar_path, 'verify.html')
print(f"\nverify.html path: {verify_path}")
print(f"verify.html exists: {os.path.exists(verify_path)}")

# List all verify.html files
print("\n🔎 Searching for verify.html everywhere...")
verify_files = []
for root, dirs, files in os.walk('.'):
    if 'verify.html' in files:
        full_path = os.path.join(root, 'verify.html')
        verify_files.append(full_path)
        print(f"Found: {full_path}")

if verify_files:
    print(f"\n✅ Found {len(verify_files)} verify.html files")
    for path in verify_files:
        print(f"  {path}")
else:
    print("\n❌ No verify.html found anywhere!")

# Check frontend folder too
frontend_path = os.path.join(current_dir, 'frontend')
print(f"\nfrontend path: {frontend_path}")
print(f"frontend exists: {os.path.exists(frontend_path)}")

if os.path.exists(frontend_path):
    print("Files in frontend:")
    for file in os.listdir(frontend_path):
        print(f"  - {file}")