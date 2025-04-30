'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosPrivate from '../../../../../utils/axiosPrivate';
import withAdminAuth from '@/app/middleware/withAdminAuth';
import { useAuth } from '@/app/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

function ViewDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    fee: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/pages/login');
      return;
    }

    const fetchDepartments = async () => {
      try {
        const response = await axiosPrivate.get('admin/departments/');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
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
    else if (isNaN(formData.fee)) newErrors.fee = 'Fee must be a number';
    else if (parseFloat(formData.fee) < 0) newErrors.fee = 'Fee must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        department_name: formData.department_name,
        fee: parseFloat(formData.fee)
      };

      if (!isEdit) {
        await axiosPrivate.post('admin/departments/', payload);
        setSuccessMessage('Department created successfully!');
      } else {
        if (!currentDepartmentId) {
          throw new Error('Department ID is missing for update');
        }
        await axiosPrivate.put(`admin/departments/${currentDepartmentId}/`, payload);
        setSuccessMessage('Department updated successfully!');
      }

      setFormData({
        department_name: '',
        fee: ''
      });
      setShowAddForm(false);
      setIsEdit(false);
      setCurrentDepartmentId(null);

      const updated = await axiosPrivate.get('admin/departments/');
      setDepartments(updated.data);
    } catch (error) {
      console.error('Operation error:', error);

      let errorMessage = isEdit ? 'Update failed. Please try again.' : 'Creation failed. Please try again.';

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
    if (deleteDepartmentId === null) return;
    try {
      await axiosPrivate.delete(`admin/departments/${deleteDepartmentId}/`);
      setDepartments((prevDepartments) =>
        prevDepartments.filter((department) => department.id !== deleteDepartmentId)
      );
      setSuccessMessage('Department deleted successfully!');
      setShowDeleteModal(false);
      setDeleteDepartmentId(null);
    } catch (error) {
      console.error('Error deleting department:', error);
      setErrors({
        form: 'Failed to delete department. Please try again.'
      });
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
              <h2 className="fw-bold">Departments</h2>
              <button className="btn btn-success" onClick={() => {
                setFormData({
                  department_name: '',
                  fee: ''
                });
                setIsEdit(false);
                setCurrentDepartmentId(null);
                setShowAddForm(true);
              }}>
                + Add Department
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

            {departments.length === 0 ? (
              <div className="alert alert-warning">No departments found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Department Name</th>
                      <th>Consultation Fee (₹)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((department, index) => (
                      <tr key={department.id}>
                        <td>{index + 1}</td>
                        <td>{department.department_name}</td>
                        <td>{department.fee}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => {
                            setIsEdit(true);
                            setCurrentDepartmentId(department.id);
                            setFormData({
                              department_name: department.department_name,
                              fee: department.fee
                            });
                            setShowAddForm(true);
                          }}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => {
                            setDeleteDepartmentId(department.id);
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
            <h2 className="text-center mb-4 fw-bold">{isEdit ? 'Edit Department' : 'Add Department'}</h2>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.form && <div className="alert alert-danger">{errors.form}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fw-bold">Department Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.department_name ? 'is-invalid' : ''}`}
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                />
                {errors.department_name && <div className="invalid-feedback">{errors.department_name}</div>}
              </div>

              <div className="mb-3">
                <label className="fw-bold">Consultation Fee (₹)*</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.fee ? 'is-invalid' : ''}`}
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                />
                {errors.fee && <div className="invalid-feedback">{errors.fee}</div>}
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowAddForm(false);
                  setIsEdit(false);
                  setFormData({
                    department_name: '',
                    fee: ''
                  });
                }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Update Department' : 'Create Department'}
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
                <p>Are you sure you want to delete this department?</p>
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

export default withAdminAuth(ViewDepartments);
