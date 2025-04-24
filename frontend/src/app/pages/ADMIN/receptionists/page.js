'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/RegisterReceptionist.module.css';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';

function RegisterReceptionist() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    salary: '',
    sex: ''
  });

  const [errors, setErrors] = useState({});
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) return;
      if (!isAuthenticated) {
        router.push('/pages/login');
        return;
      }
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    
    // Required fields validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    
    // Format validation
    if (formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (formData.salary && isNaN(formData.salary)) newErrors.salary = 'Salary must be a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    if (!validateForm()) return;

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        sex: formData.sex
      };

      const response = await axiosPrivate.post('receptionist/register/', payload);
      setSuccessMessage('Receptionist registered successfully!');
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        salary: '',
        sex: ''
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 
             'Registration failed. Please try again.'
      });
    }
  };

  if (isLoading || isAuthenticated === null) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.errorMessage}>You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register Receptionist</h1>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      {errors.form && (
        <div className={styles.errorMessage}>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2>Account Information</h2>
          <div>
            <label>Username*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className={styles.errorText}>{errors.username}</span>}
          </div>
          <div>
            <label>Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Personal Information</h2>
          <div>
            <label>First Name*</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
          </div>
          <div>
            <label>Last Name*</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
          </div>
          <div>
            <label>Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>
          <div>
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>
          <div>
            <label>Date of Birth*</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
            {errors.date_of_birth && <span className={styles.errorText}>{errors.date_of_birth}</span>}
          </div>
          <div>
            <label>Gender</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Employment Information</h2>
          <div>
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div>
            <label>Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
            {errors.salary && <span className={styles.errorText}>{errors.salary}</span>}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Register Receptionist
        </button>
      </form>
    </div>
  );
};

export default withAdminAuth(RegisterReceptionist);