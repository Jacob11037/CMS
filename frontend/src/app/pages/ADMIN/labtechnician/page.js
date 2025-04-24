'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/RegisterReceptionist.module.css';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';

function RegisterLabTechnician() {
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
    sex: '',
    lab_certification: ''
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
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

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
    if (!validateForm()) return;

    try {
      // Create user object first (assuming your API requires User first)
      const userPayload = {
        username: formData.username,
        password: formData.password,
        email: formData.email
      };

      const userResponse = await axiosPrivate.post('/register-user/', userPayload); // adjust endpoint if needed

      const labTechnicianPayload = {
        user: userResponse.data.id, // assuming backend returns user ID
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        sex: formData.sex,
        lab_certification: formData.lab_certification
      };

      await axiosPrivate.post('/labtechnicians/', labTechnicianPayload);

      setSuccessMessage('Lab Technician registered successfully!');
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
        sex: '',
        lab_certification: ''
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
      <h1 className={styles.heading}>Register Lab Technician</h1>

      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Account Information</h2>
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        {errors.username && <span className={styles.errorText}>{errors.username}</span>}
        {errors.password && <span className={styles.errorText}>{errors.password}</span>}

        <h2>Personal Info</h2>
        <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />

        <select name="sex" value={formData.sex} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows={3} />
        <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} />
        <input type="text" name="lab_certification" placeholder="Lab Certification" value={formData.lab_certification} onChange={handleChange} />

        <button type="submit" className={styles.submitButton}>Register Lab Technician</button>
      </form>
    </div>
  );
}

export default withAdminAuth(RegisterLabTechnician);
