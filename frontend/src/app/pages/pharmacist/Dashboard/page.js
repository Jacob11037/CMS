'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/app/styles/pharmacist/dashboard.css';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    setUsername(storedUsername);
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <ul className="nav-links">
          {role === 'Admin' && (
            <>
              <li><a href="/Adddoctor">Add Doctor</a></li>
              <li><a href="/AddStaff">Add Staff</a></li>
              <li><a href="/ViewlabEquipment">Add Lab Equipments</a></li>
              <li><a href="/ViewMedicine">Add Medicines</a></li>
            </>
          )}
        </ul>
      </div>

      <div className="section">
        <h2 className="welcome">Welcome to Pharmacist Dashboard</h2>
      </div>

      <div className="user-info-bar text-center">
        <p className="user-secondary-text">
          Welcome to <span className="underline-text">{username}</span> & Role
          <span className="underline-text"> {role} </span>
          <span className="underline-text logout-link" onClick={handleLogout}>
            Logout
          </span>
        </p>
      </div>

      <div className="container mt-4">
        <h3 className="text-center mb-4">Pharmacist Actions</h3>
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-primary w-50 mb-3" onClick={() => router.push('add-stock')}>
            💊 Manage Medicine
          </button>
          <button className="btn btn-info w-50" onClick={() => router.push('/MedicineBilling')}>
            💵 Medicine Billing
          </button>
        </div>
      </div>

      <div className="footer">
        <p>&copy; {new Date().getFullYear()} KIMS Hospital. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default Dashboard;

// Separate Page: ManageMedicine.jsx

export const ManageMedicine = withReceptionistAuth(() => {
  const router = useRouter();

  const goToAddStock = () => router.push('/AddStock');
  const goToUpdateStock = () => router.push('/UpdateStock');
  const goToAvailableStock = () => router.push('/AvailableStock');

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Manage Medicine</h2>
      <div className="d-flex flex-column align-items-center">
        <button className="btn btn-success w-50 mb-3" onClick={goToAddStock}>➕ Add Stock</button>
        <button className="btn btn-warning w-50 mb-3" onClick={goToUpdateStock}>✏️ Update Stock</button>
        <button className="btn btn-info w-50" onClick={goToAvailableStock}>📦 Available Stock</button>
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => router.back()}>🔙 Back</button>
      </div>
    </div>
  );
});