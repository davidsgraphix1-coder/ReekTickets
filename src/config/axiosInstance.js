import axios from 'axios';
import API_BASE from './api';

// Create axios instance with default timeout
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds timeout for all requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('reek_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config.url);
      error.message = 'Request timeout. The server is taking too long to respond.';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
