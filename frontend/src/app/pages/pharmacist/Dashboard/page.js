// File: /src/app/pages/pharmacist/dashboard/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/pharmacist/dashboard.css'
import withPharmacistAuth from '@/app/middleware/withPharmacistAuth';

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
        <h2 className="welcome">Welcome to Pharmacist</h2>
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
        <div className="d-flex justify-content-center gap-4 flex-wrap">
          <button
            className="btn square-button transparent-button"
            onClick={() => router.push('/pages/pharmacist/manage-medicine')}
          >
            💊 Manage Medicine
          </button>

          <button
            className="btn square-button transparent-button"
            onClick={() => router.push('/pages/pharmacist/create-bill')}
          >
            💵 Medicine Billing
          </button>
        </div>
      </div>

      <div className="footer">
      </div>
    </div>
  );
};

export default withPharmacistAuth(Dashboard);
