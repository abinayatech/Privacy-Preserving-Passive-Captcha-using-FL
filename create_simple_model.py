# create_simple_model.py
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense
import os

print("🧱 CREATING SIMPLE FEDERATED LEARNING MODEL")
print("=" * 60)

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Create a SIMPLE model that matches FL client expectations
print("\n🧠 Creating 3-layer neural network...")
model = Sequential([
    Dense(8, activation='relu', input_shape=(5,), name='dense_1'),
    Dense(4, activation='relu', name='dense_2'),
    Dense(1, activation='sigmoid', name='dense_3')
])

# Compile the model
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# Save the model
model_path = 'models/simple_federated_model.keras'
model.save(model_path)

print(f"\n✅ Simple model saved to: {model_path}")

# Show model architecture
print("\n📊 MODEL ARCHITECTURE:")
print("-" * 40)
model.summary()

# Show expected weight structure for FL clients
print("\n🎯 EXPECTED WEIGHT STRUCTURE FOR FL CLIENTS:")
print("-" * 40)

total_weight_arrays = 0
for i, layer in enumerate(model.layers):
    weights = layer.get_weights()
    print(f"\nLayer {i+1}: {layer.name}")
    print(f"  Type: {layer.__class__.__name__}")
    print(f"  Output shape: {layer.output.shape}")
    print(f"  Parameters: {layer.count_params()}")
    
    if weights:
        total_weight_arrays += len(weights)
        print(f"  Weight arrays: {len(weights)}")
        
        for j, w in enumerate(weights):
            if j == 0:
                print(f"    • Weights: shape={w.shape} ({w.shape[0]}×{w.shape[1]} matrix)")
            else:
                print(f"    • Biases: shape={w.shape} ({w.shape[0]} vector)")

print(f"\n📊 TOTAL WEIGHT ARRAYS: {total_weight_arrays}")
print("✅ This matches what JavaScript FL clients will send")

# Create a test to verify
print("\n🧪 VERIFICATION TEST:")
print("-" * 40)

# Test prediction
test_input = tf.constant([[1.0, 2.0, 3.0, 4.0, 5.0]], dtype=tf.float32)
prediction = model.predict(test_input, verbose=0)
print(f"Test prediction: {prediction[0][0]:.4f}")

# Get weights for FL testing
print("\n🔧 WEIGHT STRUCTURE FOR TEST_SCRIPT:")
print("-" * 40)
all_weights = []
for layer in model.layers:
    weights = layer.get_weights()
    for w in weights:
        all_weights.append(w.tolist())
        print(f"Array shape: {w.shape}, length: {len(w.flatten())}")

print(f"\n🎯 Use this in test_fl_complete.py:")
print(f"   mock_weights should have {len(all_weights)} arrays")
print(f"   First array should have {all_weights[0].shape[0] * all_weights[0].shape[1]} elements")

print("\n" + "=" * 60)
print("🚀 NEXT STEPS:")
print("1. Update flask_server.py to use this simple model")
print("2. Update test_fl_complete.py mock_weights to match")
print("3. Restart Flask server and test")