const fs = require('fs');
const path = require('path');

async function testApi() {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(path.join(__dirname, 'public/Logo.png'));
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    
    formData.append('file', blob, 'Logo.png');
    formData.append('folder', 'test-api');

    console.log('Sending request to Next.js API...');
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testApi();
