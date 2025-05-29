"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosPrivate from "../../../../../utils/axiosPrivate";
import withDoctorAuth from "@/app/middleware/withDoctorAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/doctorprofilepage.css";

const DoctorPage = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get("/doctor/profile/");
        setDoctorData(response.data);
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        setError("Failed to fetch doctor profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleAppointmentsClick = () => {
    router.push("/pages/doctor/appointments");
  };

  if (error) {
    return (
      <div className="modern-doctor-container">
        <div className="modern-error-card">
          <div className="modern-error-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3>Uh-oh! Something went wrong</h3>
          <p>{error}</p>
          <button 
            className="modern-retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-doctor-container">
      {/* Animated Background Elements */}
      <div className="modern-bg-elements">
        <div className="modern-bg-circle-1"></div>
        <div className="modern-bg-circle-2"></div>
        <div className="modern-bg-circle-3"></div>
      </div>

      {/* Hero Section */}
      <section className="modern-hero-section">
        <div className="modern-hero-content">
          <div className="modern-hero-icon">
            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h1 className="modern-hero-title">Doctor Profile</h1>
          {doctorData ? (
            <p className="modern-hero-subtitle">
              Welcome back, Dr. {doctorData.first_name} {doctorData.last_name}
            </p>
          ) : (
            <p className="modern-hero-subtitle">Welcome to your dashboard</p>
          )}
        </div>
      </section>

      {/* Profile Content */}
      <div className="modern-content-wrapper">
        {isLoading ? (
          <div className="modern-loading-card">
            <div className="modern-loading-content">
              <div className="modern-spinner"></div>
              <h3>Loading your profile...</h3>
              <p>Please wait while we fetch your information</p>
            </div>
          </div>
        ) : doctorData ? (
          <div className="modern-profile-card">
            <div className="modern-profile-header">
              <div className="modern-avatar-section">
                <div className="modern-avatar-wrapper">
                  <img
                    src="/img/team-3.jpg" 
                    alt="Doctor"
                    className="modern-avatar"
                  />
                  <div className="modern-status-indicator"></div>
                </div>
              </div>
              
              <div className="modern-profile-info">
                <h2 className="modern-doctor-name">
                  Dr. {doctorData.first_name} {doctorData.last_name}
                </h2>
                <p className="modern-department">{doctorData.department_name}</p>
                
                <div className="modern-contact-grid">
                  <div className="modern-contact-item">
                    <div className="modern-contact-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="modern-contact-details">
                      <span className="modern-contact-label">Email</span>
                      <span className="modern-contact-value">{doctorData.email}</span>
                    </div>
                  </div>
                  
                  <div className="modern-contact-item">
                    <div className="modern-contact-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div className="modern-contact-details">
                      <span className="modern-contact-label">Phone</span>
                      <span className="modern-contact-value">{doctorData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modern-profile-actions">
              <button
                className="modern-primary-btn"
                onClick={handleAppointmentsClick}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                View Appointments
              </button>
              
              <button className="modern-secondary-btn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Stats Section */}
            <div className="modern-stats-grid">
              <div className="modern-stat-card">
                <div className="modern-stat-icon">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </div>
                <div className="modern-stat-info">
                  <h4>Today&#39;s Appointments</h4>
                  <p className="modern-stat-number">8</p>
                </div>
              </div>
              
              <div className="modern-stat-card">
                <div className="modern-stat-icon">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="modern-stat-info">
                  <h4>This Week</h4>
                  <p className="modern-stat-number">42</p>
                </div>
              </div>
              
              
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default withDoctorAuth(DoctorPage);