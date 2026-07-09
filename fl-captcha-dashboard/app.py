from flask import Flask, render_template, jsonify, request, session
import numpy as np
import json
import time
import threading
import random
from datetime import datetime, timedelta
from collections import defaultdict
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'fl-captcha-secret-key-2024'

# Initialize database
def init_db():
    conn = sqlite3.connect('fl_data.db')
    c = conn.cursor()
    
    # Create tables if they don't exist
    c.execute('''CREATE TABLE IF NOT EXISTS fl_rounds
                 (id INTEGER PRIMARY KEY, 
                  round_number INTEGER,
                  accuracy REAL,
                  active_clients INTEGER,
                  total_samples INTEGER,
                  bot_detection_rate REAL,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS clients
                 (id INTEGER PRIMARY KEY,
                  client_id TEXT UNIQUE,
                  last_active DATETIME,
                  total_samples INTEGER DEFAULT 0,
                  status TEXT DEFAULT 'active')''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS bot_attempts
                 (id INTEGER PRIMARY KEY,
                  timestamp DATETIME,
                  detected_as_bot BOOLEAN,
                  confidence REAL,
                  client_id TEXT)''')
    
    # Create system_stats table for persistent state
    c.execute('''CREATE TABLE IF NOT EXISTS system_stats
                 (id INTEGER PRIMARY KEY,
                  key TEXT UNIQUE,
                  value TEXT)''')
    
    conn.commit()
    conn.close()

init_db()

class FLSimulator:
    def __init__(self):
        self.load_state()
        
    def load_state(self):
        """Load persistent state from database"""
        conn = sqlite3.connect('fl_data.db')
        c = conn.cursor()
        
        # Load or initialize stats
        c.execute("SELECT value FROM system_stats WHERE key='current_round'")
        result = c.fetchone()
        self.current_round = int(result[0]) if result else 1
        
        c.execute("SELECT value FROM system_stats WHERE key='accuracy'")
        result = c.fetchone()
        self.accuracy = float(result[0]) if result else 0.45
        
        c.execute("SELECT value FROM system_stats WHERE key='active_clients'")
        result = c.fetchone()
        self.active_clients = int(result[0]) if result else 0
        
        c.execute("SELECT value FROM system_stats WHERE key='total_samples'")
        result = c.fetchone()
        self.total_samples = int(result[0]) if result else 0
        
        c.execute("SELECT value FROM system_stats WHERE key='bot_detection_rate'")
        result = c.fetchone()
        self.bot_detection_rate = float(result[0]) if result else 0.70
        
        c.execute("SELECT value FROM system_stats WHERE key='total_clients'")
        result = c.fetchone()
        self.total_clients = int(result[0]) if result else 0
        
        self.start_time = datetime.now()
        self.lock = threading.Lock()
        self.clients = {}
        self.bot_attempts = []
        
        conn.close()
        
    def save_state(self):
        """Save current state to database"""
        conn = sqlite3.connect('fl_data.db')
        c = conn.cursor()
        
        stats = [
            ('current_round', str(self.current_round)),
            ('accuracy', str(self.accuracy)),
            ('active_clients', str(self.active_clients)),
            ('total_samples', str(self.total_samples)),
            ('bot_detection_rate', str(self.bot_detection_rate)),
            ('total_clients', str(self.total_clients))
        ]
        
        for key, value in stats:
            c.execute('''INSERT OR REPLACE INTO system_stats (key, value)
                         VALUES (?, ?)''', (key, value))
        
        conn.commit()
        conn.close()
    
    def add_client(self):
        """Add a new client with random samples"""
        with self.lock:
            client_id = f"client_{random.randint(1000, 9999)}"
            samples = random.randint(100, 150)
            
            conn = sqlite3.connect('fl_data.db')
            c = conn.cursor()
            
            # Add client to database
            c.execute('''INSERT OR REPLACE INTO clients 
                         (client_id, last_active, total_samples, status)
                         VALUES (?, ?, ?, ?)''',
                      (client_id, datetime.now(), samples, 'active'))
            
            self.total_clients += 1
            self.active_clients += 1
            self.total_samples += samples
            
            # Update dashboard statistics
            c.execute('''INSERT INTO fl_rounds 
                         (round_number, accuracy, active_clients, total_samples, bot_detection_rate)
                         VALUES (?, ?, ?, ?, ?)''',
                      (self.current_round, self.accuracy, self.active_clients, 
                       self.total_samples, self.bot_detection_rate))
            
            conn.commit()
            conn.close()
            
            self.save_state()
            
            return {
                'client_id': client_id,
                'samples': samples,
                'active_clients': self.active_clients,
                'total_samples': self.total_samples
            }
    
    def run_fl_round(self):
        """Run one federated learning round"""
        with self.lock:
            if self.active_clients < 2:
                return {
                    'success': False,
                    'message': f'Need at least 2 clients to start FL round. Currently have {self.active_clients}.',
                    'suggestion': 'Click "Add Client" button 2-3 times first'
                }
            
            # Simulate FL training
            improvement = random.uniform(0.05, 0.12)
            self.accuracy = min(0.95, self.accuracy + improvement)
            
            # Simulate bot detection improvement
            detection_improvement = random.uniform(0.01, 0.03)
            self.bot_detection_rate = min(0.98, self.bot_detection_rate + detection_improvement)
            
            # Add some random samples
            new_samples = sum(random.randint(50, 100) for _ in range(self.active_clients))
            self.total_samples += new_samples
            
            # Log this round
            conn = sqlite3.connect('fl_data.db')
            c = conn.cursor()
            
            c.execute('''INSERT INTO fl_rounds 
                         (round_number, accuracy, active_clients, total_samples, bot_detection_rate)
                         VALUES (?, ?, ?, ?, ?)''',
                      (self.current_round, self.accuracy, self.active_clients, 
                       self.total_samples, self.bot_detection_rate))
            
            conn.commit()
            conn.close()
            
            self.current_round += 1
            self.save_state()
            
            return {
                'success': True,
                'message': f'🎉 FL Round {self.current_round - 1} completed!',
                'details': f'Aggregated {self.active_clients} clients with {new_samples} new samples',
                'accuracy': self.accuracy,
                'bot_detection_rate': self.bot_detection_rate,
                'current_round': self.current_round - 1
            }
    
    def get_dashboard_data(self):
        """Get complete dashboard data"""
        with self.lock:
            conn = sqlite3.connect('fl_data.db')
            c = conn.cursor()
            
            # Get latest rounds for chart
            c.execute('''SELECT round_number, accuracy, active_clients, total_samples, bot_detection_rate 
                         FROM fl_rounds 
                         ORDER BY round_number DESC LIMIT 10''')
            rounds_data = c.fetchall()
            
            # Get recent clients
            c.execute('''SELECT client_id, last_active, total_samples, status 
                         FROM clients 
                         ORDER BY last_active DESC LIMIT 10''')
            clients_data = c.fetchall()
            
            # Get bot attempts
            c.execute('''SELECT timestamp, detected_as_bot, confidence, client_id 
                         FROM bot_attempts 
                         ORDER BY timestamp DESC LIMIT 20''')
            bot_data = c.fetchall()
            
            conn.close()
            
            # Calculate uptime
            uptime = str(datetime.now() - self.start_time).split('.')[0]
            
            return {
                'current_round': self.current_round,
                'accuracy': round(self.accuracy * 100, 2),
                'active_clients': self.active_clients,
                'total_clients': self.total_clients,
                'total_samples': self.total_samples,
                'bot_detection_rate': round(self.bot_detection_rate * 100, 2),
                'uptime': uptime,
                'rounds_history': [
                    {
                        'round': r[0],
                        'accuracy': round(r[1] * 100, 2),
                        'clients': r[2],
                        'samples': r[3],
                        'bot_detection': round(r[4] * 100, 2)
                    }
                    for r in reversed(rounds_data)
                ],
                'recent_clients': [
                    {
                        'id': c[0],
                        'last_active': c[1].split('.')[0] if '.' in c[1] else c[1],
                        'samples': c[2],
                        'status': c[3]
                    }
                    for c in clients_data
                ],
                'bot_attempts': [
                    {
                        'time': t[0].split('.')[0] if '.' in t[0] else t[0],
                        'is_bot': bool(t[1]),
                        'confidence': round(t[2] * 100, 1),
                        'client': t[3]
                    }
                    for t in bot_data
                ]
            }

# Initialize global simulator
fl_simulator = FLSimulator()

# API Routes
@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/dashboard-data')
def dashboard_data():
    return jsonify(fl_simulator.get_dashboard_data())

@app.route('/add-client', methods=['POST'])
def add_client():
    result = fl_simulator.add_client()
    return jsonify(result)

@app.route('/run-fl-round', methods=['POST'])
def run_fl_round():
    result = fl_simulator.run_fl_round()
    return jsonify(result)

@app.route('/reset-system', methods=['POST'])
def reset_system():
    global fl_simulator
    fl_simulator = FLSimulator()
    
    # Clear database but keep structure
    conn = sqlite3.connect('fl_data.db')
    c = conn.cursor()
    c.execute("DELETE FROM fl_rounds")
    c.execute("DELETE FROM clients")
    c.execute("DELETE FROM bot_attempts")
    c.execute("DELETE FROM system_stats")
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'System reset successfully!'
    })

@app.route('/fl-captcha')
def fl_captcha():
    operators = ['+', '-', '*']
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operator = random.choice(operators)
    
    if operator == '+':
        answer = num1 + num2
    elif operator == '-':
        answer = num1 - num2
    else:
        answer = num1 * num2
    
    session['captcha_answer'] = answer
    session['captcha_question'] = f"{num1} {operator} {num2}"
    
    return render_template('fl_captcha.html', question=session['captcha_question'])

@app.route('/verify-captcha', methods=['POST'])
def verify_captcha():
    try:
        user_answer = int(request.form.get('answer', 0))
        correct_answer = session.get('captcha_answer', None)
        
        if correct_answer is None:
            return jsonify({'success': False, 'message': 'No CAPTCHA challenge found'})
        
        is_human = user_answer == correct_answer
        
        # Log the attempt
        conn = sqlite3.connect('fl_data.db')
        c = conn.cursor()
        client_id = f"captcha_user_{random.randint(1000, 9999)}"
        c.execute('''INSERT INTO bot_attempts 
                     (timestamp, detected_as_bot, confidence, client_id)
                     VALUES (?, ?, ?, ?)''',
                  (datetime.now(), not is_human, 0.85 if is_human else 0.92, client_id))
        conn.commit()
        conn.close()
        
        if is_human:
            return jsonify({
                'success': True,
                'message': 'Verified as human! Contributing to FL training...'
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Incorrect answer. Please try again.'
            })
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

if __name__ == '__main__':
    # Initialize with some clients if none exist
    if fl_simulator.active_clients == 0:
        for _ in range(2):
            fl_simulator.add_client()
    
    app.run(debug=True, port=5000, threaded=True)
