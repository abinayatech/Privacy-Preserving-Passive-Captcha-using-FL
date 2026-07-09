const axios = require('axios');

async function testBackendBridge() {
    const testFeatures = [0.5, 120, 3.2, 0.8, 45.6]; // Example: real mouse/keyboard data
    
    console.log('🧪 Testing backend bridge...');
    console.log('Sending features:', testFeatures);
    
    try {
        const response = await axios.post('http://localhost:5003/predict', {
            features: testFeatures
        });
        
        console.log('✅ Success! Response:', response.data);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
    }
}

testBackendBridge();