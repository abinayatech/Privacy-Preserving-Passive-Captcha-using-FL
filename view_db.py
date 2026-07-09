# view_db.py
import sqlite3
import json

def view_database():
    conn = sqlite3.connect('federated_captcha.db')
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("📊 DATABASE CONTENTS")
    print("="*60)
    
    # Check model state
    cursor.execute("SELECT * FROM model_state")
    model_state = cursor.fetchone()
    if model_state:
        print("\n✅ MODEL STATE:")
        print(f"   Accuracy: {model_state[1]:.1f}%")
        print(f"   Total Predictions: {model_state[2]}")
        print(f"   Correct Predictions: {model_state[3]}")
        print(f"   Human Predictions: {model_state[4]}")
        print(f"   Bot Predictions: {model_state[5]}")
        print(f"   FL Rounds: {model_state[6]}")
    
    # View predictions
    cursor.execute("SELECT COUNT(*) FROM predictions")
    count = cursor.fetchone()[0]
    print(f"\n📝 PREDICTIONS (Total: {count})")
    
    if count > 0:
        cursor.execute("""
            SELECT id, session_id, prediction, confidence, correct, actual_label, timestamp 
            FROM predictions 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        rows = cursor.fetchall()
        print("\n   ID | Session                   | Pred  | Conf  | Cor | Actual | Timestamp")
        print("   " + "-"*70)
        for row in rows:
            print(f"   {row[0]:<3} | {row[1][:20]:<20} | {row[2]:<4} | {row[3]:.2f} | {row[4]}   | {row[5]:<6} | {row[6][11:19]}")
    
    # View FL rounds
    cursor.execute("SELECT COUNT(*) FROM fl_rounds")
    fl_count = cursor.fetchone()[0]
    print(f"\n🔄 FL ROUNDS (Total: {fl_count})")
    
    if fl_count > 0:
        cursor.execute("""
            SELECT round_num, clients, samples, accuracy_before, accuracy_after, gain, timestamp 
            FROM fl_rounds 
            ORDER BY round_num DESC
        """)
        rows = cursor.fetchall()
        print("\n   Round | Clients | Samples | Before | After | Gain | Timestamp")
        print("   " + "-"*60)
        for row in rows:
            print(f"   {row[0]:<5} | {row[1]:<7} | {row[2]:<7} | {row[3]:.1f}%  | {row[4]:.1f}%  | +{row[5]:.1f}% | {row[6][11:19]}")
    
    conn.close()

if __name__ == "__main__":
    view_database()