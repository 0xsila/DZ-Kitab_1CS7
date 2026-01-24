const axios = require('axios');

async function testUserApi() {
  try {
    const response = await axios.get('http://localhost:3000/api/users/1');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testUserApi();
