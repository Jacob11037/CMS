"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import styles from "../../../styles/appointmentform.module.css"
import '../../../styles/receptionist/receptionist-appointment.css'
import withReceptionistAuth from "@/app/middleware/withReceptionistAuth";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axiosPrivate from "../../../../../utils/axiosPrivate";

const AppointmentForm = () => {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    start_time: "",
    end_time: "",
    status: "Pending",
  });

  const [departments, setDepartments] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentSummary, setAppointmentSummary] = useState({});

  const router = useRouter();

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, details }) => {
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <motion.div 
          className={styles.modalContent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Confirm Appointment</h2>
          <ul>
            <li><strong>Patient:</strong> {details.patient}</li>
            <li><strong>Department:</strong> {details.department}</li>
            <li><strong>Doctor:</strong> {details.doctor}</li>
            <li><strong>Start Time:</strong> {new Date(details.start_time).toLocaleString()}</li>
            <li><strong>End Time:</strong> {details.end_time}</li>
            <li><strong>Consultation Fee:</strong> ₹{details.fee}</li>
          </ul>
          <div className={styles.modalButtons}>
            <button 
              className={`${styles.button} ${styles.submitButton}`} 
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button 
              className={`${styles.button} ${styles.cancelButton}`} 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, doctorsRes] = await Promise.all([
          axiosPrivate.get("departments/"),
          axiosPrivate.get("doctors/")
        ]);
        setDepartments(deptRes.data);
        setDoctors(doctorsRes.data);

        if (searchParams.get('reschedule')) {
          setIsRescheduling(true);
          const patientId = searchParams.get('patient');
          const doctorId = searchParams.get('doctor');
          const startTime = searchParams.get('start_time');
          const endTime = searchParams.get('end_time');

          if (patientId && doctorId) {
            try {
              const patientRes = await axiosPrivate.get(`patients/${patientId}/`);
              const patient = patientRes.data;
              
              setFormData({
                patient: patient.id,
                doctor: doctorId,
                start_time: startTime || "",
                end_time: endTime || "",
                status: "Pending",
              });
              
              setSearchQuery(`${patient.first_name} ${patient.last_name}`);
              
              const doctor = doctorsRes.data.find(d => d.staff_id === doctorId);
              if (doctor) {
                setSelectedDepartment(doctor.department_id);
              }

              toast.info('Please adjust the appointment details for rescheduling');
            } catch (error) {
              toast.error('Failed to load patient details');
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = doctors.filter(doctor => 
        doctor.department_id == selectedDepartment
      );
      setFilteredDoctors(filtered);
      setFormData(prev => ({ ...prev, doctor: "" }));
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedDepartment, doctors]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (justSelected) {
        setJustSelected(false);
        return;
      }

      if (searchQuery.length > 1) {
        fetchPatients(searchQuery);
      } else {
        setFilteredPatients([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPatients = async (query) => {
    try {
      const response = await axiosPrivate.get(`patients/?search=${query}`);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.patient) newErrors.patient = "Patient is required";
    if (!formData.doctor) newErrors.doctor = "Doctor is required";
    if (!formData.start_time) newErrors.start_time = "Start time is required";
    if (!formData.end_time) newErrors.end_time = "End time is required";
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(`${formData.start_time.split('T')[0]}T${formData.end_time}`);
      const now = new Date();
      
      // Past date validation
      if (start < now) {
        newErrors.start_time = "Cannot schedule appointments in the past";
      }
      
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    const selectedDoctor = doctors.find(doc => doc.staff_id === formData.doctor);
    const selectedDept = departments.find(dep => dep.id == selectedDepartment);
    const patientDisplay = searchQuery || "Selected Patient";
  
    setAppointmentSummary({
      patient: patientDisplay,
      doctor: selectedDoctor 
        ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` 
        : "",
      department: selectedDept?.department_name || "",
      start_time: formData.start_time,
      end_time: `${formData.start_time.split('T')[0]}T${formData.end_time}`,
      fee: selectedDept?.fee || 0
    });
    
    setShowConfirmModal(true);
  };

  const confirmAppointment = async () => {
    setShowConfirmModal(false);
  
    const finalData = {
      ...formData,
      end_time: `${formData.start_time.split('T')[0]}T${formData.end_time}`
    };
  
    try {
      setLoading(true);
      await axiosPrivate.post("appointments/", finalData);
  
      toast.success(isRescheduling ? "Appointment rescheduled!" : "Appointment created!");
  
      setFormData({
        patient: "",
        doctor: "",
        start_time: "",
        end_time: "",
        status: "Pending",
      });
      setSearchQuery("");
      setFilteredPatients([]);
      setSelectedDepartment("");
      setIsRescheduling(false);
      
      router.push("/pages/receptionist/view-appointments");
    } catch (error) {
      let errorMsg = "Something went wrong";
    
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMsg = Object.values(error.response.data)
            .flat()
            .join(' ');
        } else {
          errorMsg = error.response.data;
        }
      }
    
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    {/* Bootstrap CSS for consistency */}
    <link 
      href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
      rel="stylesheet" 
    />
    
    <motion.div 
      className="modern-appointment-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated Background Elements */}
      <div className="modern-bg-elements">
        <div className="modern-bg-circle-1"></div>
        <div className="modern-bg-circle-2"></div>
        <div className="modern-bg-circle-3"></div>
      </div>

      <h1 className="modern-appointment-header">
        {isRescheduling ? 'Reschedule Appointment' : 'Create Appointment'}
      </h1>

      <form onSubmit={handleSubmit} className="modern-appointment-form">
        
        {/* Patient Information Card */}
        <div className="modern-appointment-card">
          <div className="modern-card-header">
            <div className="modern-card-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h2 className="modern-card-title">Patient Information</h2>
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Search Patient:</label>
            <div className="modern-input-wrapper">
              <input
                type="text"
                className={`modern-input ${errors.patient ? 'is-invalid' : ''}`}
                placeholder="Search by name, phone, or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isRescheduling}
              />
              <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              {filteredPatients.length > 0 && (
                <div className="modern-dropdown">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.id}
                      className="modern-dropdown-item"
                      onClick={() => {
                        setFormData({ ...formData, patient: patient.id });
                        setSearchQuery(`${patient.first_name} ${patient.last_name}`);
                        setFilteredPatients([]);
                        setJustSelected(true);
                      }}
                    >
                      <div className="patient-info">
                        <span className="patient-name">{patient.first_name} {patient.last_name}</span>
                        <span className="patient-phone">({patient.phone})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.patient && <div className="modern-error">{errors.patient}</div>}
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="modern-appointment-card">
          <div className="modern-card-header">
            <div className="modern-card-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h2 className="modern-card-title">Appointment Details</h2>
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Department:</label>
            <div className="modern-input-wrapper">
              <select 
                className={`modern-select ${errors.department ? 'is-invalid' : ''}`}
                value={selectedDepartment} 
                onChange={handleDepartmentChange}
                required
                disabled={isRescheduling}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          {selectedDepartment && (
            <div className="modern-form-group">
              <label className="modern-form-label">Consultation Fee:</label>
              <div className="modern-fee-display">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
                <span>₹{departments.find(dep => dep.id == selectedDepartment)?.fee || 'N/A'}</span>
              </div>
            </div>
          )}

          {selectedDepartment && (
            <div className="modern-form-group">
              <label className="modern-form-label">Doctor:</label>
              <div className="modern-input-wrapper">
                <select
                  className={`modern-select ${errors.doctor ? 'is-invalid' : ''}`}
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                  disabled={isRescheduling}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor.staff_id} value={doctor.staff_id}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </option>
                  ))}
                </select>
                <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              {errors.doctor && <div className="modern-error">{errors.doctor}</div>}
            </div>
          )}

          <div className="modern-form-group">
            <label className="modern-form-label">Start Time:</label>
            <div className="modern-input-wrapper">
              <input
                type="datetime-local"
                name="start_time"
                className={`modern-input ${errors.start_time ? 'is-invalid' : ''}`}
                value={formData.start_time}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                max={(() => {
                  const now = new Date();
                  const threeDaysLater = new Date(now);
                  threeDaysLater.setDate(now.getDate() + 3);
                  return threeDaysLater.toISOString().slice(0, 16);
                })()}
              />
              <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            {errors.start_time && <div className="modern-error">{errors.start_time}</div>}
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">End Time:</label>
            <div className="modern-input-wrapper">
              <input
                type="time"
                className={`modern-input ${errors.end_time ? 'is-invalid' : ''}`}
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
              <svg className="modern-input-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            {errors.end_time && <div className="modern-error">{errors.end_time}</div>}
          </div>
        </div>

        {/* Actions Card */}
        <div className="modern-appointment-card">
          <div className="modern-card-header">
            <div className="modern-card-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="modern-card-title">Actions</h2>
          </div>

          <div className="modern-button-group">
            <button 
              type="submit" 
              className="modern-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="modern-spinner"></div>
                  {isRescheduling ? "Rescheduling..." : "Creating..."}
                </div>
              ) : (
                <>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  {isRescheduling ? "Reschedule Appointment" : "Create Appointment"}
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="modern-cancel-btn"
              onClick={() => router.push("/pages/receptionist/view-appointments")}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Appointments
            </button>
          </div>
          
          {errors.submit && (
            <div className="modern-alert">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" fill="currentColor" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                {errors.submit}
              </div>
            </div>
          )}
        </div>
      </form>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAppointment}
        details={appointmentSummary}
      />
    </motion.div>
  </>
);
}

export default withReceptionistAuth(AppointmentForm);