'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegisterDoctor() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    department_id: '',
    address: '',
    salary: '',
    sex: '',
    availability: true,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
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
      setIsLoading(false);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
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
      const payload = {
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        department_id: parseInt(formData.department_id),
        address: formData.address,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        sex: formData.sex,
        availability: formData.availability,
      };

      await axiosPrivate.post('/admin/doctors/', payload);
      setSuccessMessage('Doctor registered successfully!');
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        department_id: '',
        address: '',
        salary: '',
        sex: '',
        availability: true,
      });
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    }
  };

  if (isLoading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="d-flex align-items-center justify-content-center"
         style={{
           minHeight: '100vh',
           backgroundImage: 'url("/img/img12.webp")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           padding: '2rem'
         }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '700px', width: '100%' }}>
        <h2 className="text-center mb-4 fw-bold">Register Doctor</h2>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errors.form && <div className="alert alert-danger">{errors.form}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label className="fw-bold">Username*</label>
              <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} />
              {errors.username && <div className="text-danger">{errors.username}</div>}
            </div>
            <div className="col">
              <label className="fw-bold">Password*</label>
              <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
              {errors.password && <div className="text-danger">{errors.password}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="fw-bold">First Name*</label>
              <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} />
              {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
            </div>
            <div className="col">
              <label className="fw-bold">Last Name*</label>
              <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} />
              {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Email*</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <div className="text-danger">{errors.email}</div>}
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="fw-bold">Phone</label>
              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <div className="text-danger">{errors.phone}</div>}
            </div>
            <div className="col">
              <label className="fw-bold">Date of Birth*</label>
              <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
              {errors.date_of_birth && <div className="text-danger">{errors.date_of_birth}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Department ID*</label>
            <input type="number" className="form-control" name="department_id" value={formData.department_id} onChange={handleChange} />
            {errors.department_id && <div className="text-danger">{errors.department_id}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Gender</label>
            <select className="form-select" name="sex" value={formData.sex} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Address</label>
            <textarea className="form-control" name="address" rows="3" value={formData.address} onChange={handleChange}></textarea>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Salary</label>
            <input type="number" className="form-control" name="salary" value={formData.salary} onChange={handleChange} />
            {errors.salary && <div className="text-danger">{errors.salary}</div>}
          </div>

          <div className="mb-3 form-check">
            <input type="checkbox" className="form-check-input" name="availability" checked={formData.availability} onChange={handleChange} />
            <label className="form-check-label fw-bold">Available</label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register Doctor
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAdminAuth(RegisterDoctor);
