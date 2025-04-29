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
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      await axiosPrivate.post('admin/receptionists/', payload);
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
      setErrors({});
      setShowModal(false);

      // Refetch list
      const response = await axiosPrivate.get('admin/receptionists/');
      setReceptionists(response.data);
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setErrors({
        form: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receptionist?')) return;

    try {
      await axiosPrivate.delete(`admin/receptionists/${id}/`);
      setReceptionists((prev) => prev.filter((rec) => rec.id !== id));
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      alert('Failed to delete receptionist.');
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Receptionist List</h2>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
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
                <th>Username</th>
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
              {receptionists.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.username}</td>
                  <td>{rec.first_name} {rec.last_name}</td>
                  <td>{rec.email}</td>
                  <td>{rec.phone || '-'}</td>
                  <td>{rec.date_of_birth}</td>
                  <td>{rec.sex || '-'}</td>
                  <td>{rec.salary ? `₹${rec.salary}` : '-'}</td>
                  <td>{rec.address || '-'}</td>
                  <td>
                          <Link href={`/admin/receptionists/${rec.id}`} className="btn btn-primary btn-sm me-2">Edit</Link>
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

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register Receptionist</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
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

                  <button type="submit" className="btn btn-primary w-100">
                    Register Receptionist
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ViewReceptionists);
