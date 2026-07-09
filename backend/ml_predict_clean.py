import joblib
import numpy as np
import pandas as pd
import os
import sys
import json

class BotPredictor:
    def __init__(self, model_path=None):
        """
        Initialize the bot detection predictor
        """
        # Get absolute path to project root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, '..'))
        models_dir = os.path.join(project_root, 'models')
        
        print(f"[DEBUG] Project root: {project_root}", file=sys.stderr)
        print(f"[DEBUG] Models directory: {models_dir}", file=sys.stderr)
        
        # Try to find the model
        possible_paths = [
            model_path,
            os.path.join(models_dir, 'rf_model_balanced_fixed.pkl'),
            os.path.join(models_dir, 'rf_model_v1_latest.pkl'),
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
                    print(f"[DEBUG] Trying to load model from: {path}", file=sys.stderr)
                    self.model = joblib.load(path)
                    
                    # Try to load scaler
                    scaler_path = path.replace('rf_model_balanced_fixed.pkl', 'scaler_balanced_fixed.pkl')
                    if os.path.exists(scaler_path):
                        self.scaler = joblib.load(scaler_path)
                    else:
                        alt_scaler = os.path.join(models_dir, 'scaler_balanced_fixed.pkl')
                        if os.path.exists(alt_scaler):
                            self.scaler = joblib.load(alt_scaler)
                    
                    # Try to load feature names
                    features_path = path.replace('rf_model_balanced_fixed.pkl', 'feature_names.pkl')
                    if os.path.exists(features_path):
                        self.feature_names = joblib.load(features_path)
                    else:
                        self.feature_names = ['interaction_density', 'speed_per_scroll', 'scrolls', 'switch_ratio', 'focusSwitches']
                    
                    print(f"[SUCCESS] Model loaded successfully!", file=sys.stderr)
                    print(f"   Features: {self.feature_names}", file=sys.stderr)
                    break
                    
                except Exception as e:
                    print(f"   [ERROR] Failed to load from {path}: {e}", file=sys.stderr)
        
        if self.model is None:
            print("[ERROR] Could not load model file", file=sys.stderr)
    
    def _engineer_features(self, raw_features):
        """
        Convert raw features to engineered features
        """
        mouseMoves = raw_features.get('mouseMoves', 0)
        totalDistance = raw_features.get('totalDistance', 0.0)
        scrolls = raw_features.get('scrolls', 0)
        focusSwitches = raw_features.get('focusSwitches', 0)
        
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
        """
        if self.model is None:
            return {'error': 'Model not loaded', 'label': 'unknown'}
        
        try:
            engineered = self._engineer_features(raw_features)
            
            feature_vector = pd.DataFrame([[
                engineered['interaction_density'],
                engineered['speed_per_scroll'],
                engineered['scrolls'],
                engineered['switch_ratio'],
                engineered['focusSwitches']
            ]], columns=self.feature_names)
            
            if self.scaler is not None:
                feature_vector_scaled = self.scaler.transform(feature_vector)
            else:
                feature_vector_scaled = feature_vector.values
            
            prediction = self.model.predict(feature_vector_scaled)[0]
            probabilities = self.model.predict_proba(feature_vector_scaled)[0]
            confidence = probabilities[prediction]
            
            label = 'human' if prediction == 1 else 'bot'
            
            return {
                'prediction': int(prediction),
                'label': label,
                'confidence': float(confidence),
                'probabilities': {
                    'human': float(probabilities[1]),
                    'bot': float(probabilities[0])
                }
            }
            
        except Exception as e:
            return {'error': str(e), 'label': 'error'}

# Main execution
if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        
        if input_data:
            features = json.loads(input_data)
            predictor = BotPredictor()
            result = predictor.predict(features)
            print(json.dumps(result))
        else:
            print("[TEST] Testing with sample data...", file=sys.stderr)
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
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))