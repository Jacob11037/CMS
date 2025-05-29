'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaTint, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import axiosPrivate from '../../../utils/axiosPrivate';
import '../styles/receptionist/receptionist-patientform.css'

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
    <>
      <motion.div
        className="modern-patient-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated Background Elements */}
        <div className="modern-bg-elements">
          <div className="modern-bg-circle-1"></div>
          <div className="modern-bg-circle-2"></div>
        </div>

        <div className="modern-form-card">
          {/* Header */}
          <div className="modern-form-header">
            <div className="modern-form-icon">
              <FaUserPlus size={32} color="white" />
            </div>
            <h2 className="modern-form-title">Register New Patient</h2>
            <p className="modern-form-subtitle">Enter patient information to create a new record</p>
          </div>

          {/* Form */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaUser />
                  First Name
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`modern-input ${errors.first_name ? 'is-invalid' : ''}`}
                  />
                  <FaUser className="modern-input-icon" />
                </div>
                {errors.first_name && <div className="modern-error">{errors.first_name}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaUser />
                  Last Name
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`modern-input ${errors.last_name ? 'is-invalid' : ''}`}
                  />
                  <FaUser className="modern-input-icon" />
                </div>
                {errors.last_name && <div className="modern-error">{errors.last_name}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaBirthdayCake />
                  Date of Birth
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`modern-input ${errors.date_of_birth ? 'is-invalid' : ''}`}
                  />
                  <FaBirthdayCake className="modern-input-icon" />
                </div>
                {errors.date_of_birth && <div className="modern-error">{errors.date_of_birth}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaPhone />
                  Phone
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`modern-input ${errors.phone ? 'is-invalid' : ''}`}
                  />
                  <FaPhone className="modern-input-icon" />
                </div>
                {errors.phone && <div className="modern-error">{errors.phone}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaEnvelope />
                  Email
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`modern-input ${errors.email ? 'is-invalid' : ''}`}
                  />
                  <FaEnvelope className="modern-input-icon" />
                </div>
                {errors.email && <div className="modern-error">{errors.email}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaTint />
                  Blood Group
                </label>
                <div className="modern-input-wrapper">
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className={`modern-select ${errors.blood_group ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select blood group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  <FaTint className="modern-input-icon" />
                </div>
                {errors.blood_group && <div className="modern-error">{errors.blood_group}</div>}
              </div>
            </div>

            <div className="col-12">
              <div className="modern-form-group">
                <label className="modern-form-label">
                  <FaMapMarkerAlt />
                  Address
                </label>
                <div className="modern-input-wrapper">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`modern-input ${errors.address ? 'is-invalid' : ''}`}
                  />
                  <FaMapMarkerAlt className="modern-input-icon" />
                </div>
                {errors.address && <div className="modern-error">{errors.address}</div>}
              </div>
            </div>
          </div>

          <div className="mt-4 d-flex gap-3">
            <button
              className="modern-btn-primary"
              disabled={isSubmitting}
              onClick={() => {
                if (validate()) setShowModal(true);
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="modern-spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Register Patient
                </>
              )}
            </button>
            <button
              className="modern-btn-secondary"
              onClick={() => router.back()}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modern-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modern-modal-content"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
              >
                <div className="modern-modal-header">
                  <h5 className="modern-modal-title">Confirm Patient Registration</h5>
                </div>
                <div className="modern-modal-body">
                  <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                  <p><strong>DOB:</strong> {formData.date_of_birth}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Address:</strong> {formData.address}</p>
                  <p><strong>Blood Group:</strong> {formData.blood_group}</p>
                </div>
                <div className="modern-modal-footer">
                  <button
                    className="modern-btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="modern-spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Confirm
                      </>
                    )}
                  </button>
                  <button
                    className="modern-btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default PatientForm;