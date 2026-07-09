# real_database.py - Real database queries for your dashboard
import sqlite3
from datetime import datetime, timedelta

def get_real_stats():
    """Get real statistics from federated_captcha.db"""
    conn = sqlite3.connect('federated_captcha.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Get predictions count and accuracy
    cursor.execute('''
        SELECT 
            COUNT(*) as total_predictions,
            SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_predictions,
            SUM(CASE WHEN is_human = 1 THEN 1 ELSE 0 END) as human_predictions,
            SUM(CASE WHEN is_human = 0 THEN 1 ELSE 0 END) as bot_predictions
        FROM predictions
    ''')
    
    pred_stats = cursor.fetchone()
    total_pred = pred_stats['total_predictions'] or 0
    correct_pred = pred_stats['correct_predictions'] or 0
    human_pred = pred_stats['human_predictions'] or 0
    bot_pred = pred_stats['bot_predictions'] or 0
    
    # Calculate real accuracy
    global_accuracy = (correct_pred / total_pred * 100) if total_pred > 0 else 0
    
    # 2. Get active clients
    cursor.execute('SELECT COUNT(*) as active_clients FROM active_clients WHERE is_ready = 1')
    active_clients = cursor.fetchone()['active_clients'] or 0
    
    # 3. Get FL rounds
    cursor.execute('SELECT COUNT(*) as fl_rounds FROM fl_stats')
    fl_rounds = cursor.fetchone()['fl_rounds'] or 0
    
    # 4. Get recent accuracy (last 10 predictions)
    cursor.execute('''
        SELECT 
            COUNT(*) as recent_total,
            SUM(correct) as recent_correct
        FROM predictions 
        ORDER BY timestamp DESC 
        LIMIT 10
    ''')
    recent = cursor.fetchone()
    recent_total = recent['recent_total'] or 0
    recent_correct = recent['recent_correct'] or 0
    recent_accuracy = (recent_correct / recent_total * 100) if recent_total > 0 else 0
    
    # 5. Get bot detection rate
    cursor.execute('''
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_human = 0 AND correct = 1 THEN 1 ELSE 0 END) as correct_bots
        FROM predictions
    ''')
    bot_stats = cursor.fetchone()
    bot_total = bot_stats['total'] or 0
    correct_bots = bot_stats['correct_bots'] or 0
    bot_detection_rate = (correct_bots / bot_total * 100) if bot_total > 0 else 0
    
    conn.close()
    
    return {
        'global_accuracy': round(global_accuracy, 2),
        'total_predictions': total_pred,
        'correct_predictions': correct_pred,
        'human_predictions': human_pred,
        'bot_predictions': bot_pred,
        'active_clients': active_clients,
        'fl_round': fl_rounds + 1,
        'fl_rounds_completed': fl_rounds,
        'recent_accuracy': round(recent_accuracy, 2),
        'bot_detection_rate': round(bot_detection_rate, 2),
        'false_positive_rate': round(0.0, 2),  # You can calculate this too
        'data_status': 'ACTIVE' if total_pred > 0 else 'WAITING_FOR_DATA',
        'server_uptime': '00:00:00',  # Calculate from server start time
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'model_type': 'federated',
        'bot_detection_mode': 'Strict (0.85-0.95 threshold)',
        'total_samples': total_pred * 10  # Estimate
    }

# Test it
if __name__ == '__main__':
    stats = get_real_stats()
    print("📊 REAL DATABASE STATS:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
