'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withDoctorAuth from '@/app/middleware/withDoctorAuth';
import axiosPrivate from 'utils/axiosPrivate';
import '../../../styles/doctor-dashboard-modern.css'; // Import the modern styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faCalendarCheck,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

const DoctorDashboard = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get('/doctor/profile/'); // Adjust URL to match your Django URL pattern
        setDoctorData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
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

    fetchDoctorProfile();
  }, [router]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  const dashboardCards = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile information',
      icon: faUserMd,
      path: '/pages/doctor/profile',
      color: '#667eea'
    },
    {
      id: 'appointments',
      title: 'View Appointments',
      description: 'Check your scheduled appointments',
      icon: faCalendarCheck,
      path: '/pages/doctor/appointments',
      color: '#764ba2'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <div className="modern-dashboard-container">
          <div className="modern-dashboard-content">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && !doctorData) {
    return (
      <>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <div className="modern-dashboard-container">
          <div className="modern-dashboard-content">
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
     
      <div className="modern-dashboard-container">
        {/* Animated Background Elements */}
        <div className="modern-dashboard-bg-elements">
          <div className="modern-dashboard-bg-circle-1"></div>
          <div className="modern-dashboard-bg-circle-2"></div>
          <div className="modern-dashboard-bg-circle-3"></div>
        </div>
        
        {/* User Info */}
        {doctorData && (
          <div className="modern-dashboard-user-info">
            {console.log(doctorData)}
            👨‍⚕️ Dr. {doctorData?.first_name} 
          </div>
        )}
        
        {/* Main Content */}
        <div className="modern-dashboard-content">
          {/* Header */}
          <div className="modern-dashboard-header">
            <h1 className="modern-dashboard-title">Doctor Dashboard</h1>
            <p className="modern-dashboard-subtitle">
              Manage your medical practice efficiently
            </p>
          </div>
          
          {/* Welcome Section */}
          <div className="modern-dashboard-welcome">
            <h4>Welcome to your medical workspace</h4>
          </div>
          
          {/* Dashboard Cards */}
          <div className="modern-dashboard-cards">
            {dashboardCards.map((card, index) => (
              <div
                key={card.id}
                className="modern-dashboard-card"
                onClick={() => handleNavigation(card.path)}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'slideInFromBottom 0.8s ease-out forwards'
                }}
              >
                <div className="modern-dashboard-card-icon">
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <h5 className="modern-dashboard-card-title">{card.title}</h5>
                <p className="modern-dashboard-card-description">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default withDoctorAuth(DoctorDashboard);