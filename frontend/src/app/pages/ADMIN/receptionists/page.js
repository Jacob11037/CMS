'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function ViewReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
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
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteReceptionistId, setDeleteReceptionistId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchReceptionists = async () => {
      try {
        const response = await axiosPrivate.get('admin/receptionists/');
        setReceptionists(response.data);
      } catch (error) {
        console.error('Error fetching receptionists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceptionists();
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
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

    if (formData.username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
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
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      if (!isEdit) await axiosPrivate.post('admin/receptionists/', payload);
      else await axiosPrivate.put(`admin/receptionists/${editData.id}/`, payload);

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
      setShowAddForm(false);
      setIsEdit(false);

      const updated = await axiosPrivate.get('admin/receptionists/');
      setReceptionists(updated.data);
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    }
  };

  const handleDelete = async () => {
    if (deleteReceptionistId === null) return;
    try {
      await axiosPrivate.delete(`admin/receptionists/${deleteReceptionistId}/`);
      setReceptionists((prevReceptionists) =>
        prevReceptionists.filter((receptionist) => receptionist.id !== deleteReceptionistId)
      );
      setSuccessMessage('Receptionist deleted successfully!');
      setShowDeleteModal(false);
      setDeleteReceptionistId(null);
    } catch (error) {
      console.error('Error deleting Receptionist:', error);
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Receptionist List</h2>
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
            sex: ''
          });
          setIsEdit(false);
          setShowAddForm(true);
        }}>
          + Add Receptionist
        </button>
      </div>

      {receptionists.length === 0 ? (
        <div className="alert alert-warning">No receptionists found.</div>
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
                <th>Salary</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.map((rec, index) => (
                <tr key={rec.id}>
                  <td>{index + 1}</td>
                  <td>{rec.first_name} {rec.last_name}</td>
                  <td>{rec.email}</td>
                  <td>{rec.phone || '-'}</td>
                  <td>{rec.date_of_birth}</td>
                  <td>{rec.sex || '-'}</td>
                  <td>{rec.salary ? `₹${rec.salary}` : '-'}</td>
                  <td>{rec.address || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => {
                        setIsEdit(true);
                        setEditData(rec);
                        setFormData({
                          username: rec.username || '',
                          password: '', // Keep blank unless updating
                          first_name: rec.first_name,
                          last_name: rec.last_name,
                          email: rec.email,
                          phone: rec.phone || '',
                          date_of_birth: rec.date_of_birth,
                          address: rec.address || '',
                          salary: rec.salary || '',
                          sex: rec.sex || ''
                        });
                        setShowAddForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeleteReceptionistId(rec.id);
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

      {/* Form */}
      {formData && showAddForm && (
        <>
          <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Receptionist' : 'Add Receptionist'}</h2>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {errors.form && <div className="alert alert-danger">{errors.form}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">Username*</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && <div className="text-danger">{errors.username}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">Password*</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">First Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">Last Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="fw-bold">Email*</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="text-danger">{errors.email}</div>}
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="fw-bold">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <div className="text-danger">{errors.phone}</div>}
              </div>
              <div className="col">
                <label className="fw-bold">Date of Birth*</label>
                <input
                  type="date"
                  className="form-control"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                {errors.date_of_birth && <div className="text-danger">{errors.date_of_birth}</div>}
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
                className="form-control"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
              />
              {errors.salary && <div className="text-danger">{errors.salary}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {isEdit ? 'Update Receptionist' : 'Register Receptionist'}
            </button>
          </form>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this receptionist?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  No
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ViewReceptionists);
