const axios = require('axios');

async function testLogin() {
  try {
    console.log('Probando login...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testLogin();
