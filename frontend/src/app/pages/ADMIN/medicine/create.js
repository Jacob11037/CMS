'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddMedicine() {
  const [formData, setFormData] = useState({
    medicine_name: '',
    price: '',
    medicine_desc: '',
    manufacturer: '',
    stock: '',
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
    if (!formData.medicine_name.trim()) newErrors.medicine_name = 'Medicine name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0)
      newErrors.price = 'Price must be a positive number';
    if (!formData.medicine_desc.trim()) newErrors.medicine_desc = 'Description is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (formData.stock === '') newErrors.stock = 'Stock is required';
    else if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0)
      newErrors.stock = 'Stock must be a non-negative integer';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      await axiosPrivate.post('admin/medicines/', payload);
      setSuccessMessage('Medicine added successfully!');
      setFormData({
        medicine_name: '',
        price: '',
        medicine_desc: '',
        manufacturer: '',
        stock: '',
        requires_prescription: true
      });
    } catch (error) {
      console.error('Add Medicine error:', error.response?.data);
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
        <h2 className="text-center mb-4 fw-bold">Add Medicine</h2>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {errors.form && (
          <div className="alert alert-danger">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="fw-bold">Medicine Name*</label>
            <input type="text" className="form-control" name="medicine_name" value={formData.medicine_name} onChange={handleChange} />
            {errors.medicine_name && <div className="text-danger">{errors.medicine_name}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Price (₹)*</label>
            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} />
            {errors.price && <div className="text-danger">{errors.price}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Description*</label>
            <textarea className="form-control" name="medicine_desc" rows="3" value={formData.medicine_desc} onChange={handleChange}></textarea>
            {errors.medicine_desc && <div className="text-danger">{errors.medicine_desc}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Manufacturer*</label>
            <input type="text" className="form-control" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            {errors.manufacturer && <div className="text-danger">{errors.manufacturer}</div>}
          </div>

          <div className="mb-3">
            <label className="fw-bold">Stock*</label>
            <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleChange} />
            {errors.stock && <div className="text-danger">{errors.stock}</div>}
          </div>

          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" name="requires_prescription" checked={formData.requires_prescription} onChange={handleChange} />
            <label className="form-check-label fw-bold">
              Requires Prescription
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Add Medicine
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAdminAuth(AddMedicine);
