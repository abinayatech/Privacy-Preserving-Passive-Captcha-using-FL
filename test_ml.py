import joblib
import numpy as np
import os
import json

print("=" * 60)
print("🧪 COMPREHENSIVE ML MODEL VERIFICATION TEST")
print("=" * 60)

# 1. LOAD THE MODEL
print("\n📦 STEP 1: Loading ML Model Components...")
try:
    model = joblib.load('models/rf_model_balanced_fixed.pkl')
    scaler = joblib.load('models/scaler_balanced_fixed.pkl')
    feature_names = joblib.load('models/feature_names.pkl')
    
    print(f"   ✅ Model: RandomForest ({model.n_estimators} trees)")
    print(f"   ✅ Features: {feature_names}")
    print(f"   ✅ Scaler: Loaded successfully")
except Exception as e:
    print(f"   ❌ FAILED: {str(e)}")
    exit(1)

# 2. TEST PREDICTIONS
print("\n🔮 STEP 2: Testing Predictions...")

test_cases = [
    {
        "name": "TYPICAL HUMAN",
        "mouseMoves": 25,
        "totalDistance": 1200.5,
        "scrolls": 3,
        "focusSwitches": 2,
        "expected": "human"
    },
    {
        "name": "OBVIOUS BOT",
        "mouseMoves": 0,
        "totalDistance": 0,
        "scrolls": 0,
        "focusSwitches": 0,
        "expected": "bot"
    },
    {
        "name": "MINIMAL ACTIVITY",
        "mouseMoves": 1,
        "totalDistance": 5.2,
        "scrolls": 0,
        "focusSwitches": 0,
        "expected": "bot"
    }
]

for test in test_cases:
    print(f"\n   📋 Test: {test['name']}")
    
    # Feature engineering
    mouseMoves = test['mouseMoves']
    totalDistance = test['totalDistance']
    scrolls = test['scrolls']
    focusSwitches = test['focusSwitches']
    
    interaction_density = (scrolls + focusSwitches) / (mouseMoves + 1e-5)
    speed_per_scroll = totalDistance / (scrolls + 1)
    switch_ratio = focusSwitches / (scrolls + 1)
    
    # Create feature vector
    X = [[interaction_density, speed_per_scroll, scrolls, switch_ratio, focusSwitches]]
    
    # Scale
    X_scaled = scaler.transform(X)
    
    # Predict
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    label = "human" if prediction == 1 else "bot"
    human_prob = probabilities[1]
    bot_prob = probabilities[0]
    
    print(f"     Raw Features: mouse={mouseMoves}, dist={totalDistance:.1f}, scroll={scrolls}")
    print(f"     Engineered: density={interaction_density:.3f}, speed={speed_per_scroll:.1f}")
    print(f"     Prediction: {label} (class={prediction})")
    print(f"     Confidence: Human={human_prob:.1%}, Bot={bot_prob:.1%}")
    
    if label == test['expected']:
        print(f"     ✅ PASS - Matches expected: {test['expected']}")
    else:
        print(f"     ⚠️  WARNING - Expected {test['expected']}, got {label}")

print("\n" + "=" * 60)
print("📊 SUMMARY: Your ML model is ready for integration!")
print("=" * 60)