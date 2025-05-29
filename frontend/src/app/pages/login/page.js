'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axiosPrivate from '../../../../utils/axiosPrivate';
import '../../styles/loginpage.css';
import '../../styles/loginpage-modern.css'; // Import the new modern styles
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// const API_URL = 'https://jacob.pythonanywhere.com/';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (isAuthenticated) {
      if (redirectTo && redirectTo !== '/') {
        router.push(redirectTo);
      } else {
        checkRole();
      }
    }
  }, [isAuthenticated, redirectTo, router]);

  const checkRole = async () => {
    try {
      const response = await axiosPrivate.get('/auth/check-role/');
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Error checking role:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    if (userRole !== null) {
      const routes = {
        admin: '/pages/ADMIN/admindash',
        receptionist: '/pages/receptionist/dashboard',
        doctor: '/pages/doctor/dashboard',
        pharmacist: '/pages/pharmacist/Dashboard',
        labtechnician: '/pages/labtechnician/dashboard',
      };
      const destination = routes[userRole] || '/pages/forbidden';
      router.push(destination);
    }
  }, [userRole, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsLoading(true);
  setError('');

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("API base URL not defined.");

    const response = await axios.post(`${apiUrl}/auth/jwt/create/`, formData);
    const { access, refresh } = response.data;
    login(access, refresh);
    if (redirectTo === '/') {
      await checkRole();
    } else {
      router.push(redirectTo);
    }
  } catch (error) {
    console.error(error);
    setError('Invalid credentials');
    toast.error('Invalid credentials');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="modern-login-container">
        {/* Animated Background Elements */}
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>

        {/* Main Login Card */}
        <div className="modern-login-card">
          {/* Header */}
          <div className="modern-login-header">
            <div className="modern-login-icon">
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="modern-login-title">Welcome Back</h2>
            <p className="modern-login-subtitle">Sign in to your account to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="modern-alert">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" fill="currentColor" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="modern-login-form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="modern-form-group">
              <label className="modern-form-label">Username</label>
              <div className="modern-input-wrapper">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`modern-input ${formErrors.username ? 'is-invalid' : ''}`}
                  required
                  disabled={isLoading}
                />
                <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              {formErrors.username && (
                <div className="modern-error">{formErrors.username}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="modern-form-group">
              <label className="modern-form-label">Password</label>
              <div className="modern-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`modern-input ${formErrors.password ? 'is-invalid' : ''}`}
                  required
                  disabled={isLoading}
                />
                <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                </svg>
                <button
                  type="button"
                  className="modern-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    ) : (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password && (
                <div className="modern-error">{formErrors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="modern-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="modern-spinner"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="modern-footer">
            <p>Secure login powered by advanced encryption</p>
          </div>
        </div>
      </div>
    </>
  );
}