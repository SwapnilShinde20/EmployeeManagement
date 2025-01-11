import React, { createContext, useState, useEffect } from 'react';
import { getUser, logout } from '../api/auth.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(authToken);
        setUser(response.data.user);
        setAuthToken(response.data.user.token);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout,authToken,setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};
