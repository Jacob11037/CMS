'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../utils/axiosPrivate';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/RegisterDoctor.module.css'; 

export default function RegisterDoctor() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
  });

  const [errors, setErrors] = useState({});
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) {
        return;
      }

      if (!isAuthenticated) {
        router.push('/pages/login');
        return;
      }

      const fetchDepartments = async () => {
        try {
          const response = await axiosPrivate.get('departments/');
          setDepartments(response.data);
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
      };

      fetchDepartments();
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  if (isLoading || isAuthenticated === null) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  // Frontend Validation Function
  const validateForm = () => {
    let newErrors = {};
    if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits.';
    }
    if (!formData.department) {
      newErrors.department = 'Please select a department.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return; // Stop submission if validation fails

    try {
      const response = await axiosPrivate.post('doctor/register/', formData);
      console.log(response.data);
      alert('Doctor registered successfully');
    } catch (error) {
      console.error('Error during form submission:', error.response || error.message);
      setErrors({ form: 'Failed to register doctor. Try again.' });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register Doctor</h1>
      {errors.form && <p className={styles.errorMessage}>{errors.form}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className={styles.errorText}>{errors.username}</p>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className={styles.errorText}>{errors.password}</p>}
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
        </div>
        <div>
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select a department</option>
            {departments.map((department) => (
              <option key={department.pk} value={department.pk}>
                {department.department_name}
              </option>
            ))}
          </select>
          {errors.department && <p className={styles.errorText}>{errors.department}</p>}
        </div>
        <button className={styles.button} type="submit">Register</button>
      </form>
    </div>
  );
}