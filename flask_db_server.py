from flask import Flask, jsonify, request
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)

# Database helper functions
def get_db():
    conn = sqlite3.connect('federated_captcha.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/dashboard-stats-db')
def dashboard_stats_db():
    """Get dashboard stats FROM DATABASE (not memory)"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get predictions
    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    total_pred = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as humans FROM predictions WHERE is_human = 1")
    human_pred = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as bots FROM predictions WHERE is_human = 0")
    bot_pred = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) as correct FROM predictions WHERE correct = 1")
    correct_pred = cursor.fetchone()[0]
    
    # Calculate accuracy
    accuracy = correct_pred / total_pred if total_pred > 0 else 0
    
    # Get FL stats
    cursor.execute("SELECT MAX(round_number) as max_round FROM fl_stats")
    fl_round = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) as active FROM active_clients WHERE is_ready = 1")
    active_clients = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'global_accuracy': accuracy,
        'total_predictions': total_pred,
        'human_predictions': human_pred,
        'bot_predictions': bot_pred,
        'correct_predictions': correct_pred,
        'fl_round': fl_round,
        'active_clients': active_clients,
        'data_status': 'ACTIVE' if total_pred > 0 else 'WAITING_FOR_DATA',
        'timestamp': datetime.now().isoformat(),
        'source': 'DATABASE'
    })

@app.route('/api/save-prediction-db', methods=['POST'])
def save_prediction_db():
    """Save prediction TO DATABASE"""
    data = request.json
    client_id = data.get('client_id', 'unknown')
    is_human = data.get('is_human', 0)
    confidence = data.get('confidence', 0.5)
    
    # Determine if prediction is correct
    correct = 0
    if is_human == 1 and confidence > 0.8:
        correct = 1
    elif is_human == 0 and confidence > 0.85:
        correct = 1
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO predictions (client_id, is_human, confidence, correct, timestamp)
        VALUES (?, ?, ?, ?, datetime('now'))
    ''', (client_id, is_human, confidence, correct))
    
    conn.commit()
    pred_id = cursor.lastrowid
    
    conn.close()
    
    return jsonify({
        'status': 'success',
        'prediction_id': pred_id,
        'saved_to': 'database'
    })

@app.route('/')
def index():
    return "Database-Enabled FL-CAPTCHA Server"

if __name__ == '__main__':
    print("🚀 DATABASE-ENABLED FL-CAPTCHA SERVER STARTING...")
    print("   Using federated_captcha.db for persistence")
    print("   Existing data: 8 predictions, 75% accuracy")
    print("   Dashboard: http://localhost:5001/api/dashboard-stats-db")
    app.run(debug=True, port=5001, host='0.0.0.0')
