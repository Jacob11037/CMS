'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserDoctor,
  faUserTie,
  faFlask,
  faPills,
  faMicroscope,
  faSyringe,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  const cardStyle = {
    height: '180px',
    width: '180px',
    borderRadius: '14px',
    boxShadow: '0 4px 10px rgba(104, 236, 9, 0.1)',
    fontSize: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    backgroundColor: 'lightblue',
    color: '#343a40',
    textDecoration: 'none',
    textAlign: 'center',
  };

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundImage: "url('/img/pic1.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(239, 243, 243, 0.85)',
          borderRadius: '12px',
          padding: '30px',
        }}
      >
        <div className="section text-center">
          <h2 className="welcome">Welcome to Admin Dashboard</h2>
        </div>

        <div className="user-info-bar text-center mb-4">
          <p className="user-secondary-text">
            Welcome <span className="underline-text">{username}</span> & Role
            <span className="underline-text"> {role} </span>
            <span
              className="underline-text logout-link"
              onClick={handleLogout}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Logout
            </span>
          </p>
        </div>

        <div className="container">
          <h4 className="text-center mb-4">Admin Actions</h4>

          {/* First Row - 4 buttons */}
          <div className="row justify-content-center gap-4 mb-4">
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/doctors')}>
              <FontAwesomeIcon icon={faUserDoctor} size="2x" className="mb-2" />
              Doctor
            </div>
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/receptionists')}>
              <FontAwesomeIcon icon={faUserTie} size="2x" className="mb-2" />
              Receptionist
            </div>
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/labtechnician')}>
              <FontAwesomeIcon icon={faFlask} size="2x" className="mb-2" />
              Lab Tech
            </div>
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/pharmacist')}>
              <FontAwesomeIcon icon={faPills} size="2x" className="mb-2" />
              Pharmacist
            </div>
          </div>

          {/* Second Row - 3 buttons */}
          <div className="row justify-content-center gap-4">
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/labtest')}>
              <FontAwesomeIcon icon={faMicroscope} size="2x" className="mb-2" />
              Lab Test
            </div>
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/medicine')}>
              <FontAwesomeIcon icon={faSyringe} size="2x" className="mb-2" />
              Medicine
            </div>
            <div className="col-md-2 text-center btn btn-light" style={cardStyle} onClick={() => handleNavigation('/pages/ADMIN/department')}>
              <FontAwesomeIcon icon={faSyringe} size="2x" className="mb-2" />
              Department
            </div>
          </div>
        </div>

        <div className="footer mt-4 text-center">
          <p>&copy; {new Date().getFullYear()} KIMS Hospital. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default withReceptionistAuth(AdminDashboard);
