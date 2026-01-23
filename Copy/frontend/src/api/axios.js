import axios from 'axios';

// Helper to determine base URL
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) return '/api';
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.endsWith('/api')) url += '/api';
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Message API functions
export const getAllConversations = async () => {
  const res = await api.get('/messages');
  return res.data;
};

export const getListingConversation = async (listingId) => {
  const res = await api.get(`/messages/listing/${listingId}`);
  return res.data;
};

export const sendMessage = async ({ listingId, content }) => {
  const res = await api.post('/messages', { listingId, content });
  return res.data;
};

export default api;
