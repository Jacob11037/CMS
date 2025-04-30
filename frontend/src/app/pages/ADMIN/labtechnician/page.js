'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function ViewLabTechnicians() {
  const [labTechnicians, setLabTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentLabTechnicianId, setCurrentLabTechnicianId] = useState(null);
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
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteLabTechnicianId, setDeleteLabTechnicianId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchLabTechnicians = async () => {
      try {
        const response = await axiosPrivate.get('admin/labtechnicians/');
        setLabTechnicians(response.data);
      } catch (error) {
        console.error('Error fetching lab technicians:', error);
        setErrors({
          form: 'Failed to load lab technicians. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLabTechnicians();
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
    if (!formData.lab_certification) newErrors.lab_certification = 'Lab certification is required';

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
        lab_certification: formData.lab_certification
      };

      if (!isEdit) {
        await axiosPrivate.post('admin/labtechnicians/', payload);
        setSuccessMessage('Lab Technician registered successfully!');
      } else {
        if (!currentLabTechnicianId) {
          throw new Error('Lab Technician ID is missing for update');
        }
        await axiosPrivate.put(`admin/labtechnicians/${currentLabTechnicianId}/`, payload);
        setSuccessMessage('Lab Technician updated successfully!');
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
        lab_certification: ''
      });
      setShowAddForm(false);
      setIsEdit(false);
      setCurrentLabTechnicianId(null);

      const updated = await axiosPrivate.get('admin/labtechnicians/');
      setLabTechnicians(updated.data);
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
    if (deleteLabTechnicianId === null) return;
    try {
      await axiosPrivate.delete(`admin/labtechnicians/${deleteLabTechnicianId}/`);
      setLabTechnicians((prevLabTechnicians) =>
        prevLabTechnicians.filter((tech) => tech.id !== deleteLabTechnicianId)
      );
      setSuccessMessage('Lab Technician deleted successfully!');
      setShowDeleteModal(false);
      setDeleteLabTechnicianId(null);
    } catch (error) {
      console.error('Error deleting Lab Technician:', error);
      setErrors({
        form: 'Failed to delete lab technician. Please try again.'
      });
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Lab Technician List</h2>
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
            lab_certification: ''
          });
          setIsEdit(false);
          setCurrentLabTechnicianId(null);
          setShowAddForm(true);
        }}>
          + Add Lab Technician
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

      {labTechnicians.length === 0 ? (
        <div className="alert alert-warning">No lab technicians found.</div>
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
                <th>Certification</th>
                <th>Salary</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTechnicians.map((tech, index) => (
                <tr key={tech.id}>
                  <td>{index + 1}</td>
                  <td>{tech.first_name} {tech.last_name}</td>
                  <td>{tech.email}</td>
                  <td>{tech.phone || '-'}</td>
                  <td>{tech.date_of_birth}</td>
                  <td>{tech.sex || '-'}</td>
                  <td>{tech.lab_certification || '-'}</td>
                  <td>{tech.salary ? `₹${tech.salary}` : '-'}</td>
                  <td>{tech.address || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => {
                        setIsEdit(true);
                        setCurrentLabTechnicianId(tech.id);
                        setFormData({
                          username: tech.username || '',
                          password: '',
                          first_name: tech.first_name,
                          last_name: tech.last_name,
                          email: tech.email,
                          phone: tech.phone || '',
                          date_of_birth: tech.date_of_birth,
                          address: tech.address || '',
                          salary: tech.salary || '',
                          sex: tech.sex || '',
                          lab_certification: tech.lab_certification || ''
                        });
                        setShowAddForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeleteLabTechnicianId(tech.id);
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
          <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Lab Technician' : 'Add Lab Technician'}</h2>
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
              <label className="fw-bold">Lab Certification*</label>
              <input
                type="text"
                className={`form-control ${errors.lab_certification ? 'is-invalid' : ''}`}
                name="lab_certification"
                value={formData.lab_certification}
                onChange={handleChange}
              />
              {errors.lab_certification && <div className="invalid-feedback">{errors.lab_certification}</div>}
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
                {isEdit ? 'Update Lab Technician' : 'Register Lab Technician'}
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
                <p>Are you sure you want to delete this lab technician?</p>
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

export default withAdminAuth(ViewLabTechnicians);