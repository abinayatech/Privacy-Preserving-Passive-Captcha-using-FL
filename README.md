# 🛡️ Privacy-Preserving Passive CAPTCHA using Federated Learning

### Redefining Human Verification through Behavioral Biometrics and Privacy-Preserving AI

![Python](https://img.shields.io/badge/Python-3.10-blue) ![Flask](https://img.shields.io/badge/Flask-Backend-black) ![TensorFlow](https://img.shields.io/badge/TensorFlow-ML-orange) ![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-Classification-yellow) ![Federated Learning](https://img.shields.io/badge/Federated-Learning-green)

> **Privacy-Preserving Passive CAPTCHA using Federated Learning** is an intelligent human verification framework that replaces traditional challenge-response CAPTCHAs with **continuous behavioral authentication**. The system combines **Behavioral Biometrics**, **Machine Learning**, and **Federated Learning** to detect automated bots while preserving user privacy by ensuring behavioral data remains on the client device.

---

# 🚀 The Core Concept

Traditional CAPTCHA systems interrupt users with image puzzles and text recognition tasks, degrading user experience while becoming increasingly vulnerable to AI-powered bots.

**Our solution introduces a Passive CAPTCHA framework that authenticates users invisibly through natural interaction patterns.**

### 🧠 How It Works

### 1️⃣ Observe

The system continuously captures user interaction signals including:

* Mouse movements
* Click behavior
* Keyboard dynamics
* Scrolling activity
* Session timing

without interrupting the user's browsing experience.

### 2️⃣ Learn

Behavioral features are processed locally using a Machine Learning model trained to distinguish human interaction from automated scripts.

Instead of transmitting sensitive behavioral information, only model updates are shared using **Federated Learning**, preserving user privacy.

### 3️⃣ Detect

The trained model performs real-time classification to determine whether the current session belongs to a legitimate user or a bot.

---

# 🧠 Key Features

## 🖱️ Passive Behavioral Authentication

Unlike traditional CAPTCHA systems, users never solve puzzles.

* Invisible authentication
* Continuous verification
* Frictionless user experience
* Non-intrusive bot detection

---

## 🤖 Behavioral Biometrics Engine

The system extracts multiple behavioral characteristics including:

* Mouse trajectory analysis
* Cursor velocity and acceleration
* Click frequency analysis
* Keystroke dynamics
* Typing speed
* Scroll behavior
* Session duration
* User interaction timing

These behavioral signatures are transformed into machine learning features for human-bot classification.

---

## 🤝 Federated Learning Framework

Rather than collecting behavioral datasets on a centralized server, the project adopts a **Federated Learning** architecture.

Features include:

* Local model training
* Privacy-preserving model updates
* Global model aggregation
* Distributed collaborative learning
* No transmission of raw behavioral data

---

## ⚡ Intelligent Bot Detection

The detection engine provides:

* Real-time inference
* Human/Bot prediction
* Automated risk assessment
* Adaptive model improvement
* Improved resistance against AI-generated bot behavior

---

# 🏗️ System Architecture

```text
                  User Interaction
                         │
                         ▼
        Behavioral Data Collection Layer
(Mouse • Keyboard • Click • Scroll • Timing)
                         │
                         ▼
              Feature Engineering Module
                         │
                         ▼
           Local Machine Learning Model
                         │
                         ▼
            Federated Learning Client
                         │
                         ▼
          Global Model Aggregation Server
                         │
                         ▼
             Updated Global FL Model
                         │
                         ▼
            Human / Bot Classification
```

---

# 🛠️ Technology Stack

### 🌐 Frontend

* HTML5
* CSS3
* JavaScript

### ⚙️ Backend

* Python
* Flask

### 🧠 Machine Learning

* TensorFlow
* Scikit-learn
* NumPy
* Pandas

### 🔒 Privacy & Security

* Behavioral Biometrics
* Federated Learning
* Privacy-Preserving Machine Learning

### 🧪 Testing

* Playwright
* Selenium
* Python Testing Framework

### 💻 Development Tools

* Git
* GitHub
* Visual Studio Code

---

# ⚙️ Installation & Setup

## Clone the Repository

```bash
git clone https://github.com/abinayatech/Privacy-Preserving-Passive-Captcha-using-federated-learning.git
```

```bash
cd Privacy-Preserving-Passive-Captcha-using-federated-learning
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Run the Backend Server

```bash
python flask_server.py
```

This starts the Flask backend responsible for feature extraction, behavioral analysis, and prediction services.

---

## 🤖 Run the Bot Detection Module

Open a new terminal and execute:

```bash
python simple_popup_test.py
```

This module simulates behavioral interactions and validates the Passive CAPTCHA detection pipeline.

---

## 🗄️ View the Behavioral Database

```bash
python view_db.py
```

Displays stored behavioral features, prediction results, and collected interaction records.

---

## 🌐 Launch the Application

Open your browser and visit:

```
http://127.0.0.1:5000
```

---

# 📊 Behavioral Features

The machine learning model utilizes multiple behavioral attributes, including:

* Mouse Movement Patterns
* Cursor Velocity
* Mouse Click Frequency
* Typing Dynamics
* Keystroke Latency
* Scroll Behavior
* Session Duration
* Interaction Timing
* User Activity Patterns

---

# 🔒 Privacy by Design

Unlike centralized authentication systems, this project follows a **Privacy-Preserving Federated Learning** approach.

✔ Behavioral data never leaves the client device.

✔ Only model parameters are shared with the aggregation server.

✔ User privacy is preserved throughout the learning process.

✔ The global model continuously improves without compromising sensitive user information.

---

# 🎯 Applications

* Government Identity Portals
* Aadhaar Authentication Systems
* Banking & Financial Services
* E-Governance Platforms
* Healthcare Portals
* Educational Institutions
* Enterprise Authentication Systems
* E-Commerce Platforms
* Secure Web Applications


 *"Building intelligent authentication systems that protect privacy while delivering seamless user experiences."*
