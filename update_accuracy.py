# update_accuracy.py - Call this from your Flask app
import sqlite3
from datetime import datetime

def update_global_accuracy():
    """Update global accuracy from predictions table"""
    conn = sqlite3.connect('federated_captcha.db')
    cursor = conn.cursor()
    
    # Calculate from 'correct' column (your actual column name)
    cursor.execute('''
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM predictions
    ''')
    
    total, correct = cursor.fetchone()
    total = total or 0
    correct = correct or 0
    accuracy = (correct / total * 100) if total > 0 else 0
    
    # Update global_accuracy table
    cursor.execute('''
        INSERT OR REPLACE INTO global_accuracy 
        (id, accuracy, total_predictions, correct_predictions, last_updated)
        VALUES (1, ?, ?, ?, ?)
    ''', (accuracy, total, correct, datetime.now()))
    
    conn.commit()
    conn.close()
    
    print(f"[ACC UPDATE] {accuracy:.2f}% ({correct}/{total})")
    return accuracy

if __name__ == "__main__":
    acc = update_global_accuracy()
    print(f"Current accuracy: {acc:.2f}%")
