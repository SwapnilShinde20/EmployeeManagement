import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeesTable from '../components/EmployeesTable.jsx';

const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>
      <button onClick={handleLogout} className="btn-secondary">
        Logout
      </button>
      <div className="mt-4">
      <EmployeesTable/>
        {/* Employee table */}
      </div>
    </div>
  );
};

export default Dashboard;
