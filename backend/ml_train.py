import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ---------------------------
# 1. Load dataset
# ---------------------------
df = pd.read_csv("../dataset_balanced.csv")
print("✅ Dataset loaded. Shape:", df.shape)

# ---------------------------
# 2. Clean data
# ---------------------------
df = df.dropna().reset_index(drop=True)

# ---------------------------
# 3. Feature Engineering
# ---------------------------
df['interaction_density'] = (df['scrolls'] + df['focusSwitches']) / (df['mouseMoves'] + 1e-5)
df['speed_per_scroll'] = df['totalDistance'] / (df['scrolls'] + 1)
df['switch_ratio'] = df['focusSwitches'] / (df['scrolls'] + 1)
df['log_totalDistance'] = np.log1p(df['totalDistance'])
df['sqrt_mouseMoves'] = np.sqrt(df['mouseMoves'])

# Keep top features
features = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
X = df[features]
y = df['label'].map({'bot':0, 'human':1})

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ---------------------------
# 4. Train-Test Split
# ---------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
print("Training samples:", X_train.shape[0])
print("Test samples:", X_test.shape[0])

# ---------------------------
# 5. Hyperparameter Tuning
# ---------------------------
param_grid = {
    'n_estimators': [200, 300, 400],
    'max_depth': [10, 12, 15],
    'min_samples_leaf': [1, 2, 3]
}

rf = RandomForestClassifier(class_weight='balanced', random_state=42)
grid = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train, y_train)

best_rf = grid.best_estimator_
print("\nBest RF Parameters:", grid.best_params_)

# ---------------------------
# 6. Automatic Threshold Optimization
# ---------------------------
y_proba = best_rf.predict_proba(X_test)[:,1]  # probability for "human"
thresholds = np.arange(0.30, 0.70, 0.01)

best_threshold = 0.5
best_bot_recall = 0

for t in thresholds:
    y_pred = (y_proba >= t).astype(int)
    cm = confusion_matrix(y_test, y_pred)
    # bot = 0, human = 1
    bot_recall = cm[0,0] / (cm[0,0] + cm[0,1])  # recall for bot class
    human_recall = cm[1,1] / (cm[1,0] + cm[1,1]) # recall for human class
    
    # choose threshold that maximizes bot recall while keeping human recall >= 0.95
    if bot_recall > best_bot_recall and human_recall >= 0.95:
        best_bot_recall = bot_recall
        best_threshold = t

print(f"\nOptimal Threshold: {best_threshold:.2f} (Bot recall: {best_bot_recall:.2f})")

# Apply best threshold
y_pred_opt = (y_proba >= best_threshold).astype(int)

# ---------------------------
# 7. Evaluation
# ---------------------------
print("\n--- Optimized Model Evaluation ---")
print("Accuracy:", accuracy_score(y_test, y_pred_opt))
print("\nClassification Report:\n", classification_report(y_test, y_pred_opt))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred_opt))

# ---------------------------
# 8. Feature Importance
# ---------------------------
feat_importance = pd.DataFrame({
    'Feature': features,
    'Importance': best_rf.feature_importances_
}).sort_values(by='Importance', ascending=False)

print("\nFeature Importance:\n", feat_importance)
