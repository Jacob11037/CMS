'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axiosPrivate from '../../../../utils/axiosPrivate';
import '../../styles/loginpage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (isAuthenticated) {
      if (redirectTo && redirectTo !== '/') {
        router.push(redirectTo);
        window.location.reload();
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
      window.location.reload();
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
    console.log('API_URL in LoginPage:', API_URL);
    console.log('env:', process.env.NEXT_PUBLIC_API_URL)

    try {
      const response = await axios.post(`${API_URL}/auth/jwt/create/`, formData);
      const { access, refresh } = response.data;
      login(access, refresh);
      if (redirectTo === '/') {
        await checkRole();
      } else {
        router.push(redirectTo);
        window.location.reload();
      }
    } catch (error) {
      setError('Invalid credentials');
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <h2 className="header">Login</h2>

      {isLoading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input"
            required
            disabled={isLoading}
          />
          {formErrors.username && <p className="error">{formErrors.username}</p>}
        </div>
        <div className="formGroup">
          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
            disabled={isLoading}
          />
          {formErrors.password && <p className="error">{formErrors.password}</p>}
        </div>
        <button type="submit" className="button btn btn-primary w-100" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
