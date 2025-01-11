import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Your backend URL
  withCredentials: true, // Ensure cookies are sent
});

// User registration
export const register = async (data) => API.post('/api/users/register', data);

// User login
export const login = async (data) => API.post('/api/users/login', data);

// User logout
export const logout = async () => API.post('/api/users/logout');

// Get user info
export const getUser = async (token) =>
  API.get('/api/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
