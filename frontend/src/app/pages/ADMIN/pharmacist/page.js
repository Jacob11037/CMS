'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function PharmacistList() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Modal state for inline registration
  const [showModal, setShowModal] = useState(false);

  // Registration form state
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

  // Fetch pharmacist list on component mount
  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchPharmacists = async () => {
      try {
        const response = await axiosPrivate.get('/admin/pharmacists/');
        setPharmacists(response.data);
      } catch (error) {
        console.error('Failed to fetch pharmacists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
  }, [isAuthenticated, router]);

  // Modal open and close handlers
  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setErrors({});
    setSuccessMessage('');
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
  };

  // Update form data on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: [] }));
  };

  // Validate registration form
  const validateForm = () => {
    let newErrors = {};

    if (!formData.username.trim()) newErrors.username = ['This field is required.'];
    if (!formData.password) newErrors.password = ['This field is required.'];
    if (!formData.first_name.trim()) newErrors.first_name = ['This field is required.'];
    if (!formData.last_name.trim()) newErrors.last_name = ['This field is required.'];
    if (!formData.email) newErrors.email = ['This field is required.'];
    if (!formData.date_of_birth) newErrors.date_of_birth = ['This field is required.'];

    if (formData.username.trim().length < 3) newErrors.username = ['Username must be at least 3 characters'];
    if (formData.password.length < 8) newErrors.password = ['Password must be at least 8 characters'];
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = ['Invalid email format'];
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = ['Phone must be 10 digits'];
    if (formData.salary && isNaN(formData.salary)) newErrors.salary = ['Salary must be a number'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
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

      await axiosPrivate.post('admin/pharmacists/', payload);
      setSuccessMessage('Pharmacist registered successfully!');

      // Refresh the list of pharmacists
      const response = await axiosPrivate.get('/admin/pharmacists/');
      setPharmacists(response.data);

      // Clear the form
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
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      const errorResponse = error.response?.data || {};
      setErrors(prev => ({ ...prev, ...errorResponse }));
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container my-5">
      {/* Pharmacist list header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Pharmacist List</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add Pharmacist
        </button>
      </div>

      {/* List table */}
      {pharmacists.length === 0 ? (
        <div className="alert alert-info">No pharmacists found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Sex</th>
                <th>License</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {pharmacists.map(pharmacist => (
                <tr key={pharmacist.id}>
                  <td>{pharmacist.username}</td>
                  <td>{pharmacist.first_name} {pharmacist.last_name}</td>
                  <td>{pharmacist.email}</td>
                  <td>{pharmacist.phone || '-'}</td>
                  <td>{pharmacist.date_of_birth}</td>
                  <td>{pharmacist.sex || '-'}</td>
                  <td>{pharmacist.pharmacy_license || '-'}</td>
                  <td>{pharmacist.salary ? `₹${pharmacist.salary}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register Pharmacist</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                {errors.form && <div className="alert alert-danger">{errors.form}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="fw-bold">Username*</label>
                      <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} />
                      {errors.username && <div className="text-danger">{errors.username[0]}</div>}
                    </div>
                    <div className="col">
                      <label className="fw-bold">Password*</label>
                      <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                      {errors.password && <div className="text-danger">{errors.password[0]}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="fw-bold">First Name*</label>
                      <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} />
                      {errors.first_name && <div className="text-danger">{errors.first_name[0]}</div>}
                    </div>
                    <div className="col">
                      <label className="fw-bold">Last Name*</label>
                      <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} />
                      {errors.last_name && <div className="text-danger">{errors.last_name[0]}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold">Email*</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <div className="text-danger">{errors.email[0]}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="fw-bold">Phone</label>
                      <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                      {errors.phone && <div className="text-danger">{errors.phone[0]}</div>}
                    </div>
                    <div className="col">
                      <label className="fw-bold">Date of Birth*</label>
                      <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                      {errors.date_of_birth && <div className="text-danger">{errors.date_of_birth[0]}</div>}
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
                    <label className="fw-bold">Pharmacy License</label>
                    <input type="text" className="form-control" name="pharmacy_license" value={formData.pharmacy_license} onChange={handleChange} />
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold">Address</label>
                    <textarea className="form-control" name="address" rows="3" value={formData.address} onChange={handleChange}></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold">Salary</label>
                    <input type="number" className="form-control" name="salary" value={formData.salary} onChange={handleChange} />
                    {errors.salary && <div className="text-danger">{errors.salary[0]}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Register Pharmacist
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

export default withAdminAuth(PharmacistList);
