import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

print("🤖 TRAINING BOT DETECTION MODEL - FIXED FOR NO-HEADER DATASET")
print("="*50)

# Create directory structure
os.makedirs('models', exist_ok=True)

# Check if dataset exists
dataset_path = 'dataset_balanced.csv'
if not os.path.exists(dataset_path):
    print(f"❌ ERROR: {dataset_path} not found!")
    print(f"Current dir: {os.getcwd()}")
    exit(1)

# Load dataset - NO HEADERS!
print("📊 Loading dataset (no headers)...")
df = pd.read_csv(dataset_path, header=None)
print(f"✅ Loaded {len(df)} samples, {df.shape[1]} columns")

# Add column names based on your format
df.columns = [
    'session_id',      # Column 0
    'timestamp',       # Column 1  
    'mouseMoves',      # Column 2
    'totalDistance',   # Column 3
    'avgKeyInterval',  # Column 4
    'scrolls',         # Column 5
    'focusSwitches',   # Column 6
    'label'            # Column 7
]

print(f"\n📋 Dataset structure:")
print(f"Columns: {list(df.columns)}")
print(f"\nFirst 3 rows:")
print(df.head(3))

# Check labels
print(f"\n🔤 Label analysis:")
print(f"Unique labels: {df['label'].unique()}")
print(f"Label distribution:")
label_counts = df['label'].value_counts()
print(label_counts)

# Feature engineering (same as your original training)
print("\n🔧 Engineering features...")
# Convert numeric columns to appropriate types
df['mouseMoves'] = pd.to_numeric(df['mouseMoves'], errors='coerce').fillna(0)
df['totalDistance'] = pd.to_numeric(df['totalDistance'], errors='coerce').fillna(0.0)
df['scrolls'] = pd.to_numeric(df['scrolls'], errors='coerce').fillna(0)
df['focusSwitches'] = pd.to_numeric(df['focusSwitches'], errors='coerce').fillna(0)

# Create engineered features
df['interaction_density'] = (df['scrolls'] + df['focusSwitches']) / (df['mouseMoves'] + 1e-5)
df['speed_per_scroll'] = df['totalDistance'] / (df['scrolls'] + 1)
df['switch_ratio'] = df['focusSwitches'] / (df['scrolls'] + 1)

# Select features for training
features = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
X = df[features]
y = df['label']

print(f"📈 Using {len(features)} engineered features: {features}")
print(f"Feature matrix shape: {X.shape}")

# Encode labels: human=0, bot=1
print("\n🔤 Encoding labels...")
y_encoded = np.where(y == 'human', 0, 1)
print(f"Human (0): {(y_encoded == 0).sum()} samples")
print(f"Bot (1): {(y_encoded == 1).sum()} samples")

# Scale features
print("\n⚖️ Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
print("\n🎯 Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"Training: {X_train.shape[0]} samples")
print(f"Testing: {X_test.shape[0]} samples")

# Train model
print("\n🌲 Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced',
    n_jobs=-1
)
model.fit(X_train, y_train)

# Evaluate
print("\n📊 Evaluating model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"✅ Test Accuracy: {accuracy:.2%}")

print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['human', 'bot']))

# Confusion matrix
print("📈 Confusion Matrix (Rows: Actual, Columns: Predicted):")
cm = confusion_matrix(y_test, y_pred)
print(f"      Predicted")
print(f"      Human  Bot")
print(f"Actual Human  {cm[0][0]}    {cm[0][1]}")
print(f"       Bot    {cm[1][0]}    {cm[1][1]}")

# Save everything
print("\n💾 Saving model and assets...")
joblib.dump(model, 'models/rf_model_balanced_fixed.pkl')
joblib.dump(scaler, 'models/scaler_balanced_fixed.pkl')
joblib.dump(features, 'models/feature_names.pkl')

print(f"✅ Model saved: models/rf_model_balanced_fixed.pkl")
print(f"✅ Scaler saved: models/scaler_balanced_fixed.pkl")
print(f"✅ Feature names saved: models/feature_names.pkl")

# Feature importance
print("\n🎯 Feature Importance:")
importance_df = pd.DataFrame({
    'Feature': features,
    'Importance': model.feature_importances_
}).sort_values('Importance', ascending=False)
print(importance_df.to_string(index=False))

print("\n" + "="*50)
print(f"🎉 TRAINING COMPLETE! Accuracy: {accuracy:.2%}")
print("Next steps:")
print("1. Update ml_predict.py to use the new model")
print("2. Run: python backend/ml_predict.py to test")
print("3. Use in your bot detection system!")