'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function Department() {
  const [formData, setFormData] = useState({
    department_name: '',
    fee: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.department_name.trim()) newErrors.department_name = 'Department name is required';
    if (!formData.fee) newErrors.fee = 'Fee is required';
    else if (isNaN(formData.fee) || parseFloat(formData.fee) < 0) newErrors.fee = 'Fee must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axiosPrivate.post('admin/departments/', {
        department_name: formData.department_name,
        fee: parseFloat(formData.fee)
      });

      setSuccessMessage('Department created successfully!');
      setFormData({
        department_name: '',
        fee: ''
      });
    } catch (error) {
      console.error('Department creation error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 'Failed to create department. Try again.'
      });
    }
  };

  if (isLoading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/img/img12.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '2rem'
      }}
    >
      <div className="card shadow-lg p-4" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4 fw-bold">Create Department</h2>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {errors.form && (
          <div className="alert alert-danger">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold">Department Name*</label>
            <input
              type="text"
              className="form-control"
              name="department_name"
              value={formData.department_name}
              onChange={handleChange}
            />
            {errors.department_name && <div className="text-danger">{errors.department_name}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Consultation Fee*</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
            />
            {errors.fee && <div className="text-danger">{errors.fee}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Create Department</button>
        </form>
      </div>
    </div>
  );
}

export default withAdminAuth(Department);
