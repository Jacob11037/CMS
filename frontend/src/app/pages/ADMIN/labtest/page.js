'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddLabTest() {
  const [formData, setFormData] = useState({
    test_name: '',
    price: '',
    test_desc: '',
    requires_prescription: true
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.test_name.trim()) newErrors.test_name = 'Test name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0)
      newErrors.price = 'Price must be a positive number';
    if (!formData.test_desc.trim()) newErrors.test_desc = 'Test description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };
      await axiosPrivate.post('admin/lab-tests/', payload);
      setSuccessMessage('Lab test added successfully!');
      setFormData({
        test_name: '',
        price: '',
        test_desc: '',
        requires_prescription: true
      });
    } catch (error) {
      console.error('Add Lab Test error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 'Submission failed. Please try again.'
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
      <div className="card shadow-lg p-4" style={{ maxWidth: '700px', width: '100%' }}>
        <h2 className="text-center mb-4 fw-bold">Add Lab Test</h2>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {errors.form && (
          <div className="alert alert-danger">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold">Test Name*</label>
            <input type="text" className="form-control" name="test_name" value={formData.test_name} onChange={handleChange} />
            {errors.test_name && <div className="text-danger">{errors.test_name}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Price (₹)*</label>
            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} />
            {errors.price && <div className="text-danger">{errors.price}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Description*</label>
            <textarea className="form-control" name="test_desc" rows="3" value={formData.test_desc} onChange={handleChange}></textarea>
            {errors.test_desc && <div className="text-danger">{errors.test_desc}</div>}
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" name="requires_prescription" checked={formData.requires_prescription} onChange={handleChange} />
            <label className="form-check-label fw-bold">
              Requires Prescription
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Add Lab Test
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAdminAuth(AddLabTest);
