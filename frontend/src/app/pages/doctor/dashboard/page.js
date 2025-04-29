'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withDoctorAuth from '@/app/middleware/withDoctorAuth';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faCalendarCheck,
  faPrescription,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

const DoctorDashboard = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
  }, []);



  const handleNavigation = (path) => {
    router.push(path);
  };

  const cardStyle = {
    height: '180px',
    width: '180px',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(116, 212, 235, 0.1)',
    fontSize: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div className="dashboard-container">
      <div className="section">
        <h2 className="welcome">Welcome to Doctor Dashboard</h2>
      </div>



      <div className="container">
        <h4 className="text-center mb-4">Doctor Actions</h4>
        <div className="row justify-content-center gap-4">
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/doctor/profile')}
          >
            <FontAwesomeIcon icon={faUserMd} size="2x" className="mb-2" />
            Profile
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/doctor/appointments')}
          >
            <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="mb-2" />
            View Appointments
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/doctor/view-prescriptions')}
          >
            <FontAwesomeIcon icon={faPrescription} size="2x" className="mb-2" />
            Prescriptions
          </div>
        </div>
      </div>
    </div>
  );
};

export default withDoctorAuth(DoctorDashboard);
