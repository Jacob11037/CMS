'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faFileMedical,
  faCalendarAlt,
  faFileInvoiceDollar,
  faRightFromBracket,
  faCalendarPlus,
  faFileCirclePlus,
} from '@fortawesome/free-solid-svg-icons';

const ReceptionistDashboard = () => {
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
      <div className="section text-center">
        <h2 className="welcome">Welcome to Receptionist Dashboard</h2>
      </div>



      <div className="container">
        <h4 className="text-center mb-4">Receptionist Actions</h4>
        <div className="row justify-content-center gap-4">
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/receptionist/profile')}
          >
            <FontAwesomeIcon icon={faUser} size="2x" className="mb-2" />
            Profile
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/receptionist/register-patient')}
          >
            <FontAwesomeIcon icon={faFileMedical} size="2x" className="mb-2" />
            Register Patient
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/receptionist/view-appointments')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="mb-2" />
            View Appointments
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/receptionist/view-bills')}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} size="2x" className="mb-2" />
            View Bills
          </div>
          <div
            className="col-md-2 text-center btn btn-light"
            style={cardStyle}
            onClick={() => handleNavigation('/pages/receptionist/appointment')}
          >
            <FontAwesomeIcon icon={faCalendarPlus} size="2x" className="mb-2" />
            Create Appointment
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default withReceptionistAuth(ReceptionistDashboard);
