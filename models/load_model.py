import joblib

# Load the trained model
model_path = 'rf_model_v1_latest.pkl'  # adjust path if needed
model = joblib.load(model_path)

print("Model loaded successfully!")

# Example: check model type
print("Model type:", type(model))
