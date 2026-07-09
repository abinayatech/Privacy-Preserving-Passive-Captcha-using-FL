# diagnose_model.py
import tensorflow as tf
import numpy as np
import os

print("🔍 DIAGNOSING FEDERATED LEARNING MODEL STRUCTURE")
print("=" * 60)

# Check if models directory exists
models_dir = 'models'
if not os.path.exists(models_dir):
    print(f"❌ Models directory not found: {models_dir}")
    exit(1)

# List all model files
print(f"\n📁 Models in {models_dir}:")
model_files = []
for file in os.listdir(models_dir):
    if file.endswith('.keras') or file.endswith('.h5') or file.endswith('.pkl'):
        model_files.append(file)
        print(f"  • {file}")

if not model_files:
    print("❌ No model files found")
    exit(1)

# Try to load and analyze each Keras model
for model_file in model_files:
    if model_file.endswith('.keras') or model_file.endswith('.h5'):
        model_path = os.path.join(models_dir, model_file)
        print(f"\n🧪 Analyzing: {model_file}")
        print("-" * 40)
        
        try:
            model = tf.keras.models.load_model(model_path)
            
            print(f"✅ Model loaded successfully")
            print(f"📊 Model type: {type(model).__name__}")
            
            # Get model summary
            print(f"\n📈 Model Summary:")
            model.summary()
            
            print(f"\n🧩 Detailed Layer Analysis:")
            total_weight_arrays = 0
            for i, layer in enumerate(model.layers):
                print(f"\nLayer {i}: {layer.name}")
                print(f"  Type: {layer.__class__.__name__}")
                
                try:
                    if hasattr(layer, 'output'):
                        print(f"  Output shape: {layer.output.shape}")
                    elif hasattr(layer, 'output_shape'):
                        print(f"  Output shape: {layer.output_shape}")
                except:
                    print(f"  Output shape: Unknown")
                
                print(f"  Trainable: {layer.trainable}")
                print(f"  Parameters: {layer.count_params()}")
                
                # Get weights
                weights = layer.get_weights()
                if weights:
                    print(f"  Weight arrays: {len(weights)}")
                    total_weight_arrays += len(weights)
                    
                    for j, w in enumerate(weights):
                        print(f"    Weight array {j}: shape={w.shape}, dtype={w.dtype}")
                        if j == 0 and len(weights) >= 2:
                            # First is weights, second is biases
                            if len(w.shape) == 2:
                                print(f"      → Weights: {w.shape[0]}×{w.shape[1]} matrix")
                            elif len(w.shape) == 1:
                                print(f"      → Biases: {w.shape[0]} vector")
                else:
                    print(f"  No weights (non-trainable layer)")
            
            print(f"\n📊 Total weight arrays in model: {total_weight_arrays}")
            
            # Calculate total parameters
            total_params = model.count_params()
            print(f"📊 Total parameters: {total_params:,}")
            
            # Check if this matches FL client expectations
            print(f"\n🎯 FL Compatibility Check:")
            if total_weight_arrays == 6:
                print(f"✅ MATCHES FL client expectation (6 weight arrays)")
                print(f"   This is the 3-layer Dense network FL clients expect")
            else:
                print(f"⚠️  MISMATCH: FL clients expect 6 weight arrays")
                print(f"   Your model has {total_weight_arrays} weight arrays")
                print(f"   This will cause the '6 weights vs 8 weights' error!")
            
        except Exception as e:
            print(f"❌ Error loading {model_file}: {e}")
            print(f"   Trying to load with custom objects...")
            
            try:
                model = tf.keras.models.load_model(
                    model_path,
                    custom_objects=None,
                    compile=False
                )
                print(f"✅ Loaded without compilation")
                
                # Count layers
                print(f"  Layers: {len(model.layers)}")
                for i, layer in enumerate(model.layers[:3]):  # Show first 3
                    print(f"  Layer {i}: {layer.name} - {layer.__class__.__name__}")
                
            except Exception as e2:
                print(f"❌ Failed to load even without compilation: {e2}")

print("\n" + "=" * 60)
print("💡 RECOMMENDATION:")
print("1. Run: python create_simple_model.py")
print("2. Update flask_server.py to use the simple model")
print("3. Restart Flask and test again")