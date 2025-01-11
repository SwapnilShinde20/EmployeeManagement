import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Regular User', // Default role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password and confirm password
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await register(formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-md w-96 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Register</h1>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />
        <select
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value })
          }
          value={formData.role}
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Regular">Regular</option>
        </select>
          <div className='p-2'>
          Don't Have an account ?
          <Link to='/login' className='text-blue-600 px-2'> 
           Sign in
        </Link>
          </div>
        <button className="bg-blue-600 text-white p-2 rounded-md text-center font-bold cursor-pointer hover:bg-blue-700 w-full">Register</button>
      </form>
    </div>
  );
};

export default Register;
