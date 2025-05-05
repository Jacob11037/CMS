'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Import useAuth from your context
import axiosPrivate from '../../../../utils/axiosPrivate';
import '../../styles/loginpage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



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
  const redirectTo = searchParams.get('redirectTo') || '/';  // fallback to home

  const { login } = useAuth(); // Get login function from context
  const { isAuthenticated } = useAuth(); // Get authentication state

  // Check if isAuthenticated is not null before proceeding
  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Do not proceed until isAuthenticated is determined
    }

    if (isAuthenticated) {
      if (redirectTo && redirectTo !== '/') {
        router.push(redirectTo);
        window.location.reload(); // Force page reload after redirect
      } else {
        checkRole(); // already logs the user in based on role
      }
    }
  },[isAuthenticated, redirectTo, router]); // Added redirectTo and router to dependency array

  const checkRole = async () => {
  try {
    const response = await axiosPrivate.get('/auth/check-role/');
    setUserRole(response.data.role);
  } catch (error) {
    console.error('Error checking role:', error);
    setUserRole(null);
  }
};

// Handle redirection based on role
useEffect(() => {
  if (userRole !== null) {
    switch (userRole) {
      case 'admin':
        router.push('/pages/ADMIN/admindash');
        window.location.reload(); // Force page reload
        break;
      case 'receptionist':
        router.push('/pages/receptionist/dashboard');
        window.location.reload(); // Force page reload
        break;
      case 'doctor':
        router.push('/pages/doctor/dashboard');
        window.location.reload(); // Force page reload
        break;
      case 'pharmacist':
        router.push('/pages/pharmacist/Dashboard');
        window.location.reload(); // Force page reload
        break;
      case 'labtechnician':
        router.push('/pages/labtechnician/dashboard');
        window.location.reload(); // Force page reload
        break;
      default:
        // For unknown roles or no access
        router.push('/pages/forbidden');
        window.location.reload(); // Force page reload
        break;
    }

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
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
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
      const response = await axios.post('http://127.0.0.1:8000/auth/jwt/create/', formData);
      const { access, refresh } = response.data;

      // Call login function from AuthProvider
      login(access, refresh);

      // Check the user's role
      if(redirectTo === '/'){
        await checkRole();
      }
      else{
        router.push(redirectTo);
        window.location.reload(); // Force page reload after redirect
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