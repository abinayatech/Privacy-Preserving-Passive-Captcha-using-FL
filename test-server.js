const http = require('http');

console.log('🔍 Testing if server is running on port 5003...\n');

// Simple test to check if port 5003 is open
const testPort = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5003,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ SERVER IS RUNNING!');
        console.log('📍 URL: http://localhost:5003');
        console.log('📊 Status Code:', res.statusCode);
        
        try {
          const healthData = JSON.parse(data);
          console.log('🔄 Service Status:', healthData.status);
          console.log('🗂️ Database:', healthData.database?.status || 'Connected');
        } catch (e) {
          console.log('📄 Response:', data.substring(0, 100) + '...');
        }
        
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log('❌ SERVER IS NOT RUNNING');
      console.log('💡 Error:', err.message);
      console.log('\n🎯 SOLUTION:');
      console.log('   1. Open a new terminal window');
      console.log('   2. Run: node server.js');
      console.log('   3. Keep that terminal open');
      console.log('   4. Then run your bot simulation');
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Connection timeout');
      console.log('💡 Server might be busy or not responding');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Run the test
testPort().then(isRunning => {
  if (!isRunning) {
    console.log('\n🚀 QUICK START:');
    console.log('   cd "C:\\Users\\Dharani\\Documents\\FL_captcha"');
    console.log('   node server.js');
    console.log('\n💡 Then open a NEW terminal window to run: node bots_varied.js');
  } else {
    console.log('\n🎉 You can now run: node bots_varied.js');
  }
});