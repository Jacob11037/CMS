'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import '../../../styles/receptionist/receptionist-profile.css'; // Import the modern styles
import withReceptionistAuth from '@/app/middleware/withReceptionistAuth';

function ReceptionistProfilePage() {
  const [receptionistData, setReceptionistData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchReceptionistProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get('receptionist/profile/');
        setReceptionistData(response.data);
      } catch (error) {
        console.log(error);
        if (error.response) {
          if (error.response.status === 403) {
            router.push('/pages/forbidden');
          } else {
            setError('An error occurred while fetching receptionist profile');
          }
        } else {
          console.error(error);
          setError('An error occurred while fetching receptionist profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceptionistProfile();
  }, [isAuthenticated, router]);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="modern-profile-container">
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>
        <div className="modern-loading-card">
          <div className="modern-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-profile-container">
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>
        <div className="modern-error-card">
          <div className="modern-error-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="modern-profile-container">
        {/* Animated Background Elements */}
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>

        {/* Profile Header */}
        <div className="modern-profile-header">
          <div className="modern-profile-avatar">
            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="modern-profile-title">Receptionist Profile</h1>
          <p className="modern-profile-subtitle">Manage your profile and quick actions</p>
        </div>

        {/* Main Content */}
        <div className="modern-profile-content">
          {receptionistData && (
            <>
              {/* Profile Information Card */}
              <div className="modern-profile-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M20 21H4V3H14V9H20Z"/>
                    </svg>
                  </div>
                  <h3>Personal Information</h3>
                </div>
                
                <div className="modern-profile-info">
                  <div className="modern-info-row">
                    <div className="modern-info-label">Full Name</div>
                    <div className="modern-info-value">
                      {receptionistData.first_name} {receptionistData.last_name}
                    </div>
                  </div>
                  
                  <div className="modern-info-row">
                    <div className="modern-info-label">Email Address</div>
                    <div className="modern-info-value">{receptionistData.email}</div>
                  </div>
                  
                  <div className="modern-info-row">
                    <div className="modern-info-label">Phone Number</div>
                    <div className="modern-info-value">{receptionistData.phone}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="modern-actions-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3>Quick Actions</h3>
                </div>

                <div className="modern-actions-grid">
                  <button
                    className="modern-action-button appointments"
                    onClick={() => router.push('/pages/receptionist/view-appointments')}
                  >
                    <div className="modern-button-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                    <span>View Appointments</span>
                  </button>

                  <button
                    className="modern-action-button create"
                    onClick={() => router.push('/pages/receptionist/appointment')}
                  >
                    <div className="modern-button-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </div>
                    <span>Create Appointment</span>
                  </button>

                  <button
                    className="modern-action-button register"
                    onClick={() => router.push('/pages/register-patient')}
                  >
                    <div className="modern-button-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span>Register Patient</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default withReceptionistAuth(ReceptionistProfilePage);