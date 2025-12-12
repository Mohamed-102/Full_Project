import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  if (token) {
    console.log('Token found, adding Authorization header');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
