'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';
import '../../../styles/receptionist/receptionist-dashboard.css'; // Import the modern styles
import axiosPrivate from 'utils/axiosPrivate';
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
  const [receptionistData, setReceptionistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
      const fetchReceptionistProfile = async () => {
        try {
          setLoading(true);
          const response = await axiosPrivate.get('/receptionist/profile/'); // Adjust URL to match your Django URL pattern
          console.log(response)
          setReceptionistData(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching Receptionist profile:', err);
          setError('Failed to load profile data');
          
          // Handle different error scenarios
          if (err.response?.status === 401) {
            // User not authenticated - redirect to login
            router.push('/login'); // Adjust path as needed
          } else if (err.response?.status === 403) {
            // Permission denied - redirect to unauthorized page or show error
            setError('You are not authorized to access this dashboard');
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchReceptionistProfile();
    }, [router]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="modern-dashboard-container">
        {/* Animated Background Elements */}
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
          <div className="modern-bg-circle-3"></div>
        </div>

        {/* Header Section */}
        <div className="modern-dashboard-header">
          <div className="modern-header-content">
            <div className="modern-header-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <h1 className="modern-dashboard-title">Receptionist Dashboard</h1>
            {receptionistData ? (
              <p className="modern-dashboard-subtitle">
                Welcome back, {receptionistData.first_name}! Manage appointments and patient care efficiently.
              </p>
            ) : (
              <p className="modern-dashboard-subtitle">Loading your profile...</p>
            )}

          </div>
        </div>

        {/* Main Content */}
        <div className="modern-dashboard-content">
          <div className="modern-section-title">
            <h2>Quick Actions</h2>
            <p>Choose an action to get started</p>
          </div>

          <div className="modern-cards-grid">
            <div
              className="modern-action-card"
              onClick={() => handleNavigation('/pages/receptionist/profile')}
            >
              <div className="modern-card-icon profile">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <h3 className="modern-card-title">Profile</h3>
              <p className="modern-card-description">View and edit your profile information</p>
            </div>

            <div
              className="modern-action-card"
              onClick={() => handleNavigation('/pages/receptionist/register-patient')}
            >
              <div className="modern-card-icon register">
                <FontAwesomeIcon icon={faFileMedical} />
              </div>
              <h3 className="modern-card-title">Register Patient</h3>
              <p className="modern-card-description">Add new patients to the system</p>
            </div>

            <div
              className="modern-action-card"
              onClick={() => handleNavigation('/pages/receptionist/view-appointments')}
            >
              <div className="modern-card-icon appointments">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 className="modern-card-title">View Appointments</h3>
              <p className="modern-card-description">Check scheduled appointments</p>
            </div>

            <div
              className="modern-action-card"
              onClick={() => handleNavigation('/pages/receptionist/view-bills')}
            >
              <div className="modern-card-icon bills">
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
              </div>
              <h3 className="modern-card-title">View Bills</h3>
              <p className="modern-card-description">Manage patient billing information</p>
            </div>

            <div
              className="modern-action-card"
              onClick={() => handleNavigation('/pages/receptionist/appointment')}
            >
              <div className="modern-card-icon create">
                <FontAwesomeIcon icon={faCalendarPlus} />
              </div>
              <h3 className="modern-card-title">Create Appointment</h3>
              <p className="modern-card-description">Schedule new appointments</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withReceptionistAuth(ReceptionistDashboard);