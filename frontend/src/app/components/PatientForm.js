'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaTint } from 'react-icons/fa';
import axiosPrivate from '../../../utils/axiosPrivate';

const PatientForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else if (new Date(formData.date_of_birth) > new Date()) {
      newErrors.date_of_birth = 'Date of birth cannot be in the future';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone)) newErrors.phone = 'Enter a valid phone number';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.blood_group.trim()) newErrors.blood_group = 'Blood group is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await axiosPrivate.post('/patients/', formData);
      toast.success('Patient created successfully!');
    } catch (error) {
      toast.error('Error creating patient');
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <motion.div
      className="container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="mb-4">Register New Patient</h2>
      <div className="card shadow-sm p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label"><FaUser className="me-2" />First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
            />
            {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaUser className="me-2" />Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
            />
            {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaBirthdayCake className="me-2" />Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
            />
            {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaPhone className="me-2" />Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaEnvelope className="me-2" />Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaMapMarkerAlt className="me-2" />Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label"><FaTint className="me-2" />Blood Group</label>
            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              className={`form-select ${errors.blood_group ? 'is-invalid' : ''}`}
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.blood_group && <div className="invalid-feedback">{errors.blood_group}</div>}
          </div>
        </div>
        <div className="mt-4 d-flex gap-3">
          <button
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={() => {
              if (validate()) setShowModal(true);
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal fade show d-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <motion.div
                className="modal-content"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Patient Registration</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                  <p><strong>DOB:</strong> {formData.date_of_birth}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Address:</strong> {formData.address}</p>
                  <p><strong>Blood Group:</strong> {formData.blood_group}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientForm;