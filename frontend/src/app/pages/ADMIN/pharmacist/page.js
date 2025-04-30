'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function ViewPharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPharmacistId, setCurrentPharmacistId] = useState(null); // Changed from editData to currentPharmacistId
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
    pharmacy_license: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deletePharmacistId, setDeletePharmacistId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchPharmacists = async () => {
      try {
        const response = await axiosPrivate.get('admin/pharmacists/');
        setPharmacists(response.data);
      } catch (error) {
        console.error('Error fetching pharmacists:', error);
        setErrors({
          form: 'Failed to load pharmacists. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
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
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!isEdit && !formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.pharmacy_license) newErrors.pharmacy_license = 'Pharmacy license is required';

    if (formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!isEdit && formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
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
        ...(formData.password && { password: formData.password }),
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        sex: formData.sex,
        pharmacy_license: formData.pharmacy_license
      };

      if (!isEdit) {
        await axiosPrivate.post('admin/pharmacists/', payload);
        setSuccessMessage('Pharmacist registered successfully!');
      } else {
        if (!currentPharmacistId) {
          throw new Error('Pharmacist ID is missing for update');
        }
        await axiosPrivate.put(`admin/pharmacists/${currentPharmacistId}/`, payload);
        setSuccessMessage('Pharmacist updated successfully!');
      }

      // Reset form and refresh data
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
        pharmacy_license: ''
      });
      setShowAddForm(false);
      setIsEdit(false);
      setCurrentPharmacistId(null);

      const updated = await axiosPrivate.get('admin/pharmacists/');
      setPharmacists(updated.data);
    } catch (error) {
      console.error('Operation error:', error);
      
      let errorMessage = isEdit ? 'Update failed. Please try again.' : 'Registration failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      errorMessage;
      } else if (error.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrors({
        form: errorMessage
      });
    }
  };

  const handleDelete = async () => {
    if (deletePharmacistId === null) return;
    try {
      await axiosPrivate.delete(`admin/pharmacists/${deletePharmacistId}/`);
      setPharmacists((prevPharmacists) =>
        prevPharmacists.filter((pharmacist) => pharmacist.id !== deletePharmacistId)
      );
      setSuccessMessage('Pharmacist deleted successfully!');
      setShowDeleteModal(false);
      setDeletePharmacistId(null);
    } catch (error) {
      console.error('Error deleting Pharmacist:', error);
      setErrors({
        form: 'Failed to delete pharmacist. Please try again.'
      });
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Pharmacist List</h2>
        <button className="btn btn-success" onClick={() => {
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
            pharmacy_license: ''
          });
          setIsEdit(false);
          setCurrentPharmacistId(null);
          setShowAddForm(true);
        }}>
          + Add Pharmacist
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {errors.form && (
        <div className="alert alert-danger alert-dismissible fade show">
          {errors.form}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setErrors({})}
          ></button>
        </div>
      )}

      {pharmacists.length === 0 ? (
        <div className="alert alert-warning">No pharmacists found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Sl. No</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>License</th>
                <th>Salary</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacists.map((pharm, index) => (
                <tr key={pharm.id}>
                  <td>{index + 1}</td>
                  <td>{pharm.first_name} {pharm.last_name}</td>
                  <td>{pharm.email}</td>
                  <td>{pharm.phone || '-'}</td>
                  <td>{pharm.date_of_birth}</td>
                  <td>{pharm.sex || '-'}</td>
                  <td>{pharm.pharmacy_license || '-'}</td>
                  <td>{pharm.salary ? `₹${pharm.salary}` : '-'}</td>
                  <td>{pharm.address || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => {
                        setIsEdit(true);
                        setCurrentPharmacistId(pharm.id);
                        setFormData({
                          username: pharm.username || '',
                          password: '',
                          first_name: pharm.first_name,
                          last_name: pharm.last_name,
                          email: pharm.email,
                          phone: pharm.phone || '',
                          date_of_birth: pharm.date_of_birth,
                          address: pharm.address || '',
                          salary: pharm.salary || '',
                          sex: pharm.sex || '',
                          pharmacy_license: pharm.pharmacy_license || ''
                        });
                        setShowAddForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeletePharmacistId(pharm.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <div className="card shadow-lg p-4 mt-4">
          <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Pharmacist' : 'Add Pharmacist'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">Username*</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">
                  {isEdit ? 'New Password (leave blank to keep current)' : 'Password*'}
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEdit ? "Leave blank to keep current password" : ""}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">First Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">Last Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="fw-bold">Email*</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">Phone</label>
                <input
                  type="text"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">Date of Birth*</label>
                <input
                  type="date"
                  className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="fw-bold">Gender</label>
              <select
                className="form-select"
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

            <div className="mb-3">
              <label className="fw-bold">Pharmacy License*</label>
              <input
                type="text"
                className={`form-control ${errors.pharmacy_license ? 'is-invalid' : ''}`}
                name="pharmacy_license"
                value={formData.pharmacy_license}
                onChange={handleChange}
              />
              {errors.pharmacy_license && <div className="invalid-feedback">{errors.pharmacy_license}</div>}
            </div>

            <div className="mb-3">
              <label className="fw-bold">Address</label>
              <textarea
                className="form-control"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="fw-bold">Salary</label>
              <input
                type="number"
                className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
              {errors.salary && <div className="invalid-feedback">{errors.salary}</div>}
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Update Pharmacist' : 'Register Pharmacist'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this pharmacist?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ViewPharmacists);