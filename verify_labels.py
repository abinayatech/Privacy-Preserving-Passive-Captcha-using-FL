import pandas as pd
import joblib
import os

print("🔍 VERIFYING YOUR FL_captcha PROJECT SETUP")
print("="*50)

# 1. Check current directory
print(f"1. Current directory: {os.getcwd()}")

# 2. Check dataset - IT HAS NO HEADERS!
print("\n2. Checking dataset_balanced.csv (NO HEADERS)...")
try:
    # Load without headers
    df = pd.read_csv("dataset_balanced.csv", header=None)
    print(f"   ✅ Found dataset_balanced.csv")
    print(f"   Shape: {df.shape} rows, {df.shape[1]} columns")
    
    # Show first 3 rows to understand structure
    print(f"\n   First 3 rows (no headers):")
    for i in range(min(3, len(df))):
        print(f"   Row {i}: {list(df.iloc[i])}")
    
    # The label is in the LAST column (column 7, 0-indexed)
    print(f"\n   Label column (column 7): {df[7].unique()[:10]}")
    print(f"   Label distribution:")
    print(df[7].value_counts())
    
    print(f"\n   Column mapping:")
    print(f"   0: session_id")
    print(f"   1: timestamp")
    print(f"   2: mouseMoves")
    print(f"   3: totalDistance")
    print(f"   4: avgKeyInterval")
    print(f"   5: scrolls")
    print(f"   6: focusSwitches")
    print(f"   7: label")
    
except FileNotFoundError:
    print("   ❌ ERROR: dataset_balanced.csv not found!")

# 3. Check for models
print("\n3. Checking for trained models...")
models_dir = "models"
if os.path.exists(models_dir):
    print(f"   ✅ Models directory exists")
    model_files = os.listdir(models_dir)
    for f in model_files:
        print(f"   - {f}")
        
    # Check specific model
    model_path = "models/rf_model_balanced_fixed.pkl"
    if os.path.exists(model_path):
        print(f"\n   Testing model {model_path}...")
        try:
            model = joblib.load(model_path)
            print(f"   ✅ Model loaded successfully")
            
            if hasattr(model, 'n_features_in_'):
                print(f"   Model expects {model.n_features_in_} features")
            
            features_path = "models/feature_names.pkl"
            if os.path.exists(features_path):
                features = joblib.load(features_path)
                print(f"   Features used: {features}")
            
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
    else:
        print(f"   ❌ No rf_model_balanced_fixed.pkl found")
else:
    print(f"   ❌ Models directory not found!")

print("\n" + "="*50)
print("📝 YOUR DATASET FORMAT:")
print("- No headers (raw data)")
print("- 8 columns as shown above")
print("- Last column (index 7) contains 'human'/'bot' labels")
print("\n✅ READY FOR TRAINING!")
print("Run: python backend/ml_train_fixed.py")
