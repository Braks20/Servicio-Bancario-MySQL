const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Login exitoso:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Login fallido:', err.response ? err.response.status : err.message);
    if (err.response) console.error('Error data:', err.response.data);
  }
}
test();
