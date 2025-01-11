import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login } from '../api/auth.js';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { setUser ,setAuthToken} = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(credentials);      
      setUser(response.data);
      setAuthToken(response.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit} 
        className="bg-white p-8 shadow-md rounded-md w-96 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <div className='p-2'>
                  Don't Have an account ?
                  <Link to='/register' className='text-blue-600 px-2'> 
                   Sign Up
                </Link>
                  </div>
        <button className="bg-blue-600 text-white p-2 rounded-md text-center font-bold cursor-pointer hover:bg-blue-700 w-full">Login</button>
      </form>
    </div>
  );
};

export default Login;
