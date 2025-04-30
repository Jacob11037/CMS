'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import { useAuth } from '@/app/context/AuthContext';
import withAdminAuth from '@/app/middleware/withAdminAuth';

function ViewLabTests() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    test_name: '',
    price: '',
    test_desc: '',
    requires_prescription: true
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentTestId, setCurrentTestId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchLabTests = async () => {
      try {
        const response = await axiosPrivate.get('admin/lab-tests/');
        setLabTests(response.data);
      } catch (error) {
        console.error('Error fetching lab tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
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
    if (!formData.test_desc.trim()) newErrors.test_desc = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData, price: parseFloat(formData.price) };

    try {
      if (isEdit) {
        await axiosPrivate.put(`admin/lab-tests/${currentTestId}/`, payload);
        setSuccessMessage('Lab test updated successfully!');
      } else {
        await axiosPrivate.post('admin/lab-tests/', payload);
        setSuccessMessage('Lab test added successfully!');
      }

      const updated = await axiosPrivate.get('admin/lab-tests/');
      setLabTests(updated.data);

      setFormData({
        test_name: '',
        price: '',
        test_desc: '',
        requires_prescription: true
      });
      setIsEdit(false);
      setCurrentTestId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({
        form: error.response?.data?.error || 'Something went wrong.'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axiosPrivate.delete(`admin/lab-tests/${deleteTestId}/`);
      setLabTests(labTests.filter(test => test.id !== deleteTestId));
      setSuccessMessage('Lab test deleted successfully!');
      setShowDeleteModal(false);
      setDeleteTestId(null);
    } catch (error) {
      console.error('Delete error:', error);
      setErrors({ form: 'Failed to delete. Try again.' });
    }
  };

  if (loading || isAuthenticated === null) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className="container py-5" style={{
      backgroundImage: 'url("/img/img12.webp")',
      backgroundSize: 'cover',
      minHeight: '100vh'
    }}>
      <div className="card p-4 shadow-lg">
        {!showForm ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Lab Tests</h2>
              <button className="btn btn-success" onClick={() => {
                setFormData({
                  test_name: '',
                  price: '',
                  test_desc: '',
                  requires_prescription: true
                });
                setIsEdit(false);
                setShowForm(true);
              }}>
                + Add Lab Test
              </button>
            </div>

            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {errors.form && (
              <div className="alert alert-danger">{errors.form}</div>
            )}

            {labTests.length === 0 ? (
              <div className="alert alert-warning">No lab tests available.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Test Name</th>
                      <th>Price (₹)</th>
                      <th>Description</th>
                      <th>Prescription Required</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTests.map((test, index) => (
                      <tr key={test.id}>
                        <td>{index + 1}</td>
                        <td>{test.test_name}</td>
                        <td>{test.price}</td>
                        <td>{test.test_desc}</td>
                        <td>{test.requires_prescription ? 'Yes' : 'No'}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => {
                            setIsEdit(true);
                            setCurrentTestId(test.id);
                            setFormData({
                              test_name: test.test_name,
                              price: test.price,
                              test_desc: test.test_desc,
                              requires_prescription: test.requires_prescription
                            });
                            setShowForm(true);
                          }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => {
                            setDeleteTestId(test.id);
                            setShowDeleteModal(true);
                          }}>Delete</button>
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
            <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Lab Test' : 'Add Lab Test'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fw-bold">Test Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.test_name ? 'is-invalid' : ''}`}
                  name="test_name"
                  value={formData.test_name}
                  onChange={handleChange}
                />
                {errors.test_name && <div className="invalid-feedback">{errors.test_name}</div>}
              </div>

              <div className="mb-3">
                <label className="fw-bold">Price (₹)*</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>

              <div className="mb-3">
                <label className="fw-bold">Description*</label>
                <textarea
                  className={`form-control ${errors.test_desc ? 'is-invalid' : ''}`}
                  name="test_desc"
                  value={formData.test_desc}
                  rows="3"
                  onChange={handleChange}
                />
                {errors.test_desc && <div className="invalid-feedback">{errors.test_desc}</div>}
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="requires_prescription"
                  checked={formData.requires_prescription}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-bold">
                  Requires Prescription
                </label>
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowForm(false);
                  setIsEdit(false);
                  setCurrentTestId(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Update Lab Test' : 'Create Lab Test'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this lab test?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ViewLabTests);
