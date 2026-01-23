const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';

async function test() {
  try {
    // 1. Register/Login
    const email = `test${Date.now()}@example.com`;
    const password = 'Password123!';
    
    console.log('Registering user:', email);
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      first_name: 'Test',
      last_name: 'User',
      phone: '1234567890'
    });

    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    const token = loginRes.data.token;
    console.log('Got token');

    // 2. Create Listing
    const formData = new FormData();
    formData.append('isbn', '9780134685991');
    formData.append('title', 'Effective Java');
    formData.append('author', 'Joshua Bloch');
    formData.append('publication_date', '2018-01-01');
    formData.append('condition', 'new');
    formData.append('description', 'Great book');
    formData.append('price', '5000');
    
    // Create a dummy file
    const filePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(filePath, 'dummy content');
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'image/jpeg' });
    formData.append('photo', fileBlob, 'test-image.jpg');

    console.log('Creating listing...');
    try {
      const res = await axios.post(`${API_URL}/listings`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Axios with FormData (native) usually sets Content-Type automatically
        }
      });
      console.log('Listing created:', res.data);
    } catch (err) {
      console.error('Error creating listing:', err.response ? err.response.data : err.message);
    }

    // Cleanup
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error('Test failed:', err);
    if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
    }
  }
}

test();
