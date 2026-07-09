import joblib
import numpy as np
import pandas as pd
import os
import sys
import json  # ← THIS WAS MISSING!

class BotPredictor:
    def __init__(self, model_path=None):
        """
        Initialize the bot detection predictor
        
        Args:
            model_path: Path to trained RandomForest model
                      If None, tries default locations
        """
        # Get absolute path to project root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, '..'))
        models_dir = os.path.join(project_root, 'models')
        
        print(f"🔍 Project root: {project_root}", file=sys.stderr)
        print(f"🔍 Models directory: {models_dir}", file=sys.stderr)
        
        # Try to find the model - USE CORRECT PATHS
        possible_paths = [
            model_path,
            os.path.join(models_dir, 'rf_model_balanced_fixed.pkl'),  # Primary path
            os.path.join(models_dir, 'rf_model_v1_latest.pkl'),       # Alternative
            'models/rf_model_balanced_fixed.pkl',
            '../models/rf_model_balanced_fixed.pkl',
            '../../models/rf_model_balanced_fixed.pkl',
        ]
        
        self.model = None
        self.scaler = None
        self.feature_names = None
        
        for path in possible_paths:
            if path and os.path.exists(path):
                try:
                    print(f"🔍 Trying to load model from: {path}", file=sys.stderr)
                    self.model = joblib.load(path)
                    
                    # Try to load scaler
                    scaler_path = path.replace('rf_model_balanced_fixed.pkl', 'scaler_balanced_fixed.pkl')
                    if os.path.exists(scaler_path):
                        self.scaler = joblib.load(scaler_path)
                    else:
                        # Try alternative scaler path
                        alt_scaler = os.path.join(models_dir, 'scaler_balanced_fixed.pkl')
                        if os.path.exists(alt_scaler):
                            self.scaler = joblib.load(alt_scaler)
                    
                    # Try to load feature names
                    features_path = path.replace('rf_model_balanced_fixed.pkl', 'feature_names.pkl')
                    if os.path.exists(features_path):
                        self.feature_names = joblib.load(features_path)
                    else:
                        # Default feature names based on your training script
                        self.feature_names = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
                    
                    print(f"✅ Model loaded successfully!", file=sys.stderr)
                    print(f"   Features: {self.feature_names}", file=sys.stderr)
                    break
                    
                except Exception as e:
                    print(f"   ❌ Failed to load from {path}: {e}", file=sys.stderr)
        
        if self.model is None:
            print("❌ ERROR: Could not load model file", file=sys.stderr)
            print(f"   Checked paths: {possible_paths}", file=sys.stderr)
            print(f"   Models directory contents: {os.listdir(models_dir) if os.path.exists(models_dir) else 'Directory not found'}", file=sys.stderr)
    
    def _engineer_features(self, raw_features):
        """
        Convert raw features to engineered features (same as training)
        
        Args:
            raw_features: dict with original features
                - mouseMoves, totalDistance, avgKeyInterval, scrolls, focusSwitches
        
        Returns:
            dict: Engineered features
        """
        mouseMoves = raw_features.get('mouseMoves', 0)
        totalDistance = raw_features.get('totalDistance', 0.0)
        scrolls = raw_features.get('scrolls', 0)
        focusSwitches = raw_features.get('focusSwitches', 0)
        
        # Same engineering as in training script
        engineered = {
            'interaction_density': (scrolls + focusSwitches) / (mouseMoves + 1e-5),
            'speed_per_scroll': totalDistance / (scrolls + 1),
            'scrolls': scrolls,
            'switch_ratio': focusSwitches / (scrolls + 1),
            'focusSwitches': focusSwitches
        }
        
        return engineered
    
    def predict(self, raw_features):
        """
        Predict if behavior is human or bot
        
        Args:
            raw_features: dict with ORIGINAL features:
                {
                    'mouseMoves': int,
                    'totalDistance': float,
                    'avgKeyInterval': float,
                    'scrolls': int,
                    'focusSwitches': int
                }
        
        Returns:
            dict: Prediction results
        """
        if self.model is None:
            return {'error': 'Model not loaded', 'label': 'unknown'}
        
        try:
            # 1. Engineer features (same as training)
            engineered = self._engineer_features(raw_features)
            
            # 2. Create DataFrame with correct feature order
            feature_vector = pd.DataFrame([[
                engineered['interaction_density'],
                engineered['speed_per_scroll'],
                engineered['scrolls'],
                engineered['switch_ratio'],
                engineered['focusSwitches']
            ]], columns=self.feature_names)
            
            # 3. Scale features if scaler exists
            if self.scaler is not None:
                feature_vector_scaled = self.scaler.transform(feature_vector)
            else:
                feature_vector_scaled = feature_vector.values
            
            # 4. Make prediction
            prediction = self.model.predict(feature_vector_scaled)[0]
            
            # 5. Get probabilities
            probabilities = model.predict_proba(feature_vector_scaled)[0]
            confidence = probabilities[prediction]
            
            # 6. Map prediction to label
            # Assuming: 0=bot, 1=human (from your training)
            label = 'human' if prediction == 1 else 'bot'
            
            return {
                'prediction': int(prediction),
                'label': label,
                'confidence': float(confidence),
                'probabilities': {
                    'human': float(probabilities[1]),
                    'bot': float(probabilities[0])
                },
                'raw_features': raw_features,
                'engineered_features': engineered
            }
            
        except Exception as e:
            return {'error': str(e), 'label': 'error'}

# Command-line interface for Node.js integration
if __name__ == "__main__":
    try:
        # Read JSON from stdin (Node.js will send data)
        input_data = sys.stdin.read().strip()
        
        if input_data:
            features = json.loads(input_data)
            predictor = BotPredictor()
            result = predictor.predict(features)
            print(json.dumps(result))
        else:
            # Test with default data
            print("Testing with sample data...", file=sys.stderr)
            test_features = {
                'mouseMoves': 25,
                'totalDistance': 1500.0,
                'avgKeyInterval': 200,
                'scrolls': 4,
                'focusSwitches': 1
            }
            predictor = BotPredictor()
            result = predictor.predict(test_features)
            print(json.dumps(result))
            
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))