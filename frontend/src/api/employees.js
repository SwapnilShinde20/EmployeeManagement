import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Get all employees with pagination
export const getEmployees = async (page, limit,token) =>
  API.get(`/api/employees?page=${page}&limit=${limit}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Create a new employee
export const createEmployee = async (data,token) => API.post('/api/employees', data,{
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Update an employee
export const updateEmployee = async (id, data,token) =>
  API.put(`/api/employees/${id}`, data,{
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

// Delete an employee
export const deleteEmployee = async (id,token) => API.delete(`/api/employees/${id}`,{
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
