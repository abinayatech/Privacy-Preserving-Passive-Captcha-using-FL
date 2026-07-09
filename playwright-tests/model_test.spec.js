const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

async function callModel(features) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '..', 'backend', 'api_final.py');
        const pythonProcess = spawn('python', [pythonScript]);
        
        let output = '';
        let errors = '';
        
        pythonProcess.stdout.on('data', (data) => output += data.toString());
        pythonProcess.stderr.on('data', (data) => errors += data.toString());
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python error: ${errors}`));
                return;
            }
            try {
                resolve(JSON.parse(output));
            } catch (e) {
                reject(new Error(`JSON error: ${e.message}. Output: ${output}`));
            }
        });
        
        pythonProcess.stdin.write(JSON.stringify(features));
        pythonProcess.stdin.end();
    });
}

test('Test 1: Model API - Human prediction', async () => {
    console.log("🧪 Testing model with human-like data...");
    
    const result = await callModel({
        mouseMoves: 25,
        totalDistance: 1500.0,
        scrolls: 4,
        focusSwitches: 1
    });
    
    console.log("✅ Model returned:", result);
    expect(result.label).toBe('human');
    expect(result.prediction).toBe(1);
});

test('Test 2: Model API - Bot prediction', async () => {
    console.log("🧪 Testing model with bot-like data...");
    
    const result = await callModel({
        mouseMoves: 100,
        totalDistance: 50.0,
        scrolls: 0,
        focusSwitches: 0
    });
    
    console.log("✅ Model returned:", result);
    expect(result.label).toBe('bot');
    expect(result.prediction).toBe(0);
});
