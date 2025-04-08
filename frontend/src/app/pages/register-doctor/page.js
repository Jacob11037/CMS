'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../utils/axiosPrivate';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/RegisterDoctor.module.css'; 
import withAdminAuth from '@/app/middleware/withAdminAuth';

function RegisterDoctor() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    date_of_birth: '',
    address: '',
    salary: '',
    sex: '',
    availability: true
  });

  const [errors, setErrors] = useState({});
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated === null) return;
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'availability' ? e.target.checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    const currentDate = new Date();
    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - 100); // 100 years ago
    const maxDate = new Date();
    maxDate.setFullYear(currentDate.getFullYear() - 21); // At least 21 years old
    if (formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters.';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    // Name validations
  if (!formData.first_name.trim()) {
    newErrors.first_name = 'First name is required';
  } else if (formData.first_name.trim().length < 2) {
    newErrors.first_name = 'First name must be at least 2 characters';
  } else if (!/^[a-zA-Z]+$/.test(formData.first_name.trim())) {
    newErrors.first_name = 'First name can only contain letters';
  }

  if (!formData.last_name.trim()) {
    newErrors.last_name = 'Last name is required';
  } else if (formData.last_name.trim().length < 2) {
    newErrors.last_name = 'Last name must be at least 2 characters';
  } else if (!/^[a-zA-Z]+$/.test(formData.last_name.trim())) {
    newErrors.last_name = 'Last name can only contain letters';
  }

  // Email validation
  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Enter a valid email address';
  }

  // Phone validation
  if (!formData.phone) {
    newErrors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(formData.phone)) {
    newErrors.phone = 'Phone number must be 10 digits';
  }

  // Department validation
  if (!formData.department) {
    newErrors.department = 'Department selection is required';
  }

  // Date of birth validation
  if (!formData.date_of_birth) {
    newErrors.date_of_birth = 'Date of birth is required';
  } else {
    const dob = new Date(formData.date_of_birth);
    if (dob > maxDate) {
      newErrors.date_of_birth = 'Doctor must be at least 21 years old';
    } else if (dob < minDate) {
      newErrors.date_of_birth = 'Please enter a valid date';
    }
  }

  // Gender validation
  if (!formData.sex) {
    newErrors.sex = 'Gender selection is required';
  }

  // Address validation
  if (formData.address && formData.address.length > 200) {
    newErrors.address = 'Address cannot exceed 200 characters';
  }

  // Salary validation
  if (formData.salary) {
    if (isNaN(formData.salary) || Number(formData.salary) < 0) {
      newErrors.salary = 'Salary must be a positive number';
    } else if (Number(formData.salary) > 1000000) {
      newErrors.salary = 'Salary cannot exceed 1,000,000';
    }
  }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      console.log(formData)
      const response = await axiosPrivate.post('doctor/register/', formData);
      alert('Doctor registered successfully');
      // router.push('/pages/register-doctor'); // Redirect after success
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setErrors({ form: error.response?.data?.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register Doctor</h1>
      {errors.form && <p className={styles.errorMessage}>{errors.form}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Personal Information Section */}
        <div className={styles.section}>
          <h2>Personal Information</h2>
          <div className={styles.grid}>
            <div>
              <label>First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
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
              {errors.date_of_birth && <p className={styles.errorText}>{errors.date_of_birth}</p>}
            </div>
            <div>
              <label>Gender*</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.sex && <p className={styles.errorText}>{errors.sex}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className={styles.section}>
          <h2>Contact Information</h2>
          <div className={styles.grid}>
            <div>
              <label>Email*</label>
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
              <label>Phone*</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
            </div>
            <div className={styles.fullWidth}>
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className={styles.section}>
          <h2>Professional Information</h2>
          <div className={styles.grid}>
            <div>
              <label>Department*</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.pk} value={dept.pk}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              {errors.department && <p className={styles.errorText}>{errors.department}</p>}
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
            </div>
            <div>
              <label>Availability</label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                Available for appointments
              </label>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className={styles.section}>
          <h2>Account Information</h2>
          <div className={styles.grid}>
            <div>
              <label>Username*</label>
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
              <label>Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className={styles.errorText}>{errors.password}</p>}
            </div>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Register Doctor
        </button>
      </form>
    </div>
  );
};

export default withAdminAuth(RegisterDoctor);