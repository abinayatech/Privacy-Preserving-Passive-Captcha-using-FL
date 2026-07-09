# ML CAPTCHA Flask Server
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import random

print("🚀 STARTING ML CAPTCHA SERVER")
print("=" * 50)

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# ========== STATIC FILE ROUTES ==========
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/test-ml.html')
def test_ml():
    return send_from_directory('public', 'test-ml.html')

@app.route('/verify.html')
def verify():
    return send_from_directory('public', 'verify.html')

@app.route('/check-status.html')
def check_status():
    return send_from_directory('public', 'check-status.html')

@app.route('/contact.html')
def contact():
    return send_from_directory('public', 'contact.html')

@app.route('/download.html')
def download():
    return send_from_directory('public', 'download.html')

@app.route('/update.html')
def update():
    return send_from_directory('public', 'update.html')

# Static assets
@app.route('/css/<path:filename>')
def css(filename):
    return send_from_directory('public/css', filename)

@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory('public/js', filename)

@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory('public/assets', filename)

# ========== ML ENDPOINTS ==========
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "message": "ML CAPTCHA Server",
        "version": "1.0"
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data"})
        
        features = data.get('features', [])
        session_id = data.get('sessionId', 'unknown')
        
        print(f"\n📥 ML Request: {session_id}")
        print(f"   Features: {features}")
        
        if not isinstance(features, list):
            return jsonify({
                "success": False,
                "error": f"Features should be a list, got {type(features)}"
            })
        
        if len(features) != 5:
            return jsonify({
                "success": False,
                "error": f"Need exactly 5 features, got {len(features)}"
            })
        
        # Simple ML logic
        score = sum(features) / len(features)  # Average
        is_human = score > 0.5  # Threshold
        confidence = round(score, 4)
        
        print(f"   Result: {'HUMAN' if is_human else 'BOT'} ({confidence:.2f})")
        
        return jsonify({
            "success": True,
            "is_human": bool(is_human),
            "confidence": float(confidence),
            "features_received": features
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"success": False, "error": str(e)})

# ========== MAIN ==========
if __name__ == '__main__':
    print("📁 Serving files from: public/")
    print("🌐 URL: http://localhost:5000")
    print("📊 Health: http://localhost:5000/health")
    print("🤖 Predict: POST http://localhost:5000/predict")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
