'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Import useAuth from your context
import axiosPrivate from '../../../../utils/axiosPrivate';
import '../../styles/LoginPage.css'; 


export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null); 

  const router = useRouter();
  const { login } = useAuth(); // Get login function from context
  const { isAuthenticated } = useAuth(); // Get authentication state

  // Check if isAuthenticated is not null before proceeding
  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Do not proceed until isAuthenticated is determined
    }

    if (isAuthenticated) {
      router.push('/'); // Redirect to login if authenticated
      return;
    }
  });

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
        router.push('/pages/admin/profile');
        break;
      case 'receptionist':
        router.push('/pages/receptionist/profile');
        break;
      case 'doctor':
        router.push('/pages/doctor/profile');
        break;
      case 'pharmacist':
        router.push('/pages/pharmacist/profile');
        break;
      case 'labtechnician':
        router.push('/pages/labtechnician/profile');
        break;
      default:
        // For unknown roles or no access
        router.push('/pages/forbidden');
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

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/jwt/create/', formData);
      const { access, refresh } = response.data;

      // Call login function from AuthProvider
      login(access, refresh);

      // Check the user's role
      await checkRole();
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <h2 className="header">Login</h2>
      {error && <p className="errorMessage">{error}</p>}
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
          />
          {formErrors.password && <p className="error">{formErrors.password}</p>}
        </div>
        <button type="submit" className="button">Login</button>
      </form>
    </div>
  );
}