'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

function ViewMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    medicine_name: '',
    price: '',
    medicine_desc: '',
    manufacturer: '',
    stock: '',
    requires_prescription: true
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMedicineId, setDeleteMedicineId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchMedicines = async () => {
      try {
        const response = await axiosPrivate.get('admin/medicines/');
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [isAuthenticated, router]);

  const handleDelete = async () => {
    if (deleteMedicineId === null) return;
    try {
      await axiosPrivate.delete(`admin/medicines/${deleteMedicineId}/`);
      setMedicines((prev) => prev.filter((m) => m.id !== deleteMedicineId));
      setSuccessMessage('Medicine deleted successfully!');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

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
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.medicine_desc.trim()) newErrors.medicine_desc = 'Description is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (formData.stock === '') newErrors.stock = 'Stock is required';
    else if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Stock must be a non-negative integer';
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
      if (!isEdit) await axiosPrivate.post('admin/medicines/', payload);
      else await axiosPrivate.put(`admin/medicines/${editData.id}/`, payload);
      setSuccessMessage('Medicine added successfully!');
      setFormData({
        medicine_name: '',
        price: '',
        medicine_desc: '',
        manufacturer: '',
        stock: '',
        requires_prescription: true
      });
      setShowAddForm(false);
      setIsEdit(false);
      const updated = await axiosPrivate.get('admin/medicines/');
      setMedicines(updated.data);
    } catch (error) {
      console.error('Add Medicine error:', error.response?.data);
      setErrors({ form: error.response?.data?.error || 'Submission failed. Please try again.' });
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container py-5" style={{
      backgroundImage: 'url("/img/img12.webp")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh'
    }}>
      <div className="card shadow-lg p-4 bg-white">
        {!showAddForm ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Medicine Inventory</h2>
              <button className="btn btn-success" onClick={() => setShowAddForm(true)}>
                + Add Medicine
              </button>
            </div>
            {medicines.length === 0 ? (
              <div className="alert alert-warning">No medicines found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Price (₹)</th>
                      <th>Description</th>
                      <th>Manufacturer</th>
                      <th>Stock</th>
                      <th>Prescription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr key={medicine.id}>
                        <td>{index + 1}</td>
                        <td>{medicine.medicine_name}</td>
                        <td>{medicine.price}</td>
                        <td>{medicine.medicine_desc}</td>
                        <td>{medicine.manufacturer}</td>
                        <td>{medicine.stock}</td>
                        <td>{medicine.requires_prescription ? 'Yes' : 'No'}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => {
                            setIsEdit(true);
                            setEditData(medicine);
                            setFormData({
                              medicine_name: medicine.medicine_name,
                              price: medicine.price,
                              medicine_desc: medicine.medicine_desc,
                              manufacturer: medicine.manufacturer,
                              stock: medicine.stock,
                              requires_prescription: medicine.requires_prescription
                            });
                            setShowAddForm(true);
                          }}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => {
                            setDeleteMedicineId(medicine.id);
                            setShowDeleteModal(true);
                          }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.form && <div className="alert alert-danger">{errors.form}</div>}
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
                <label className="form-check-label fw-bold">Requires Prescription</label>
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowAddForm(false);
                  setIsEdit(false);
                  setFormData({
                    medicine_name: '',
                    price: '',
                    medicine_desc: '',
                    manufacturer: '',
                    stock: '',
                    requires_prescription: true
                  });
                }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">Save Medicine</button>
              </div>
            </form>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this medicine?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>No</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ViewMedicines);
