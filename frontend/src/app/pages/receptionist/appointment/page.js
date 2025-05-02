"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import styles from "../../../styles/appointmentform.module.css"
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
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className={styles.header}>
        {isRescheduling ? 'Reschedule Appointment' : 'Create Appointment'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Patient Information</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>Search Patient:</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Search by name, phone, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isRescheduling}
            />
            {filteredPatients.length > 0 && (
              <div className={styles.dropdown}>
                {filteredPatients.map(patient => (
                  <div 
                    key={patient.id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setFormData({ ...formData, patient: patient.id });
                      setSearchQuery(`${patient.first_name} ${patient.last_name}`);
                      setFilteredPatients([]);
                      setJustSelected(true);
                    }}
                  >
                    {patient.first_name} {patient.last_name} ({patient.phone})
                  </div>
                ))}
              </div>
            )}
            {errors.patient && <span className={styles.error}>{errors.patient}</span>}
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardMargin}`}>
          <h2 className={styles.cardTitle}>Appointment Details</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Department:</label>
            <select 
              className={styles.select}
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
          </div>

          {selectedDepartment && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Consultation Fee: </label>
              <p>₹{departments.find(dep => dep.id == selectedDepartment)?.fee || 'N/A'}</p>
            </div>
          )}

          {selectedDepartment && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Doctor:</label>
              <select
                className={styles.select}
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
              {errors.doctor && <span className={styles.error}>{errors.doctor}</span>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)} // Prevents past dates
              max={(() => {
                const now = new Date();
                const threeDaysLater = new Date(now);
                threeDaysLater.setDate(now.getDate() + 3);
                return threeDaysLater.toISOString().slice(0, 16);
              })()} // Sets max date to 3 days in the future
            />
            {errors.start_time && <span className={styles.error}>{errors.start_time}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>End Time:</label>
            <input
              type="time"
              className={styles.input}
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
            {errors.end_time && <span className={styles.error}>{errors.end_time}</span>}
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardMargin}`}>
          <h2 className={styles.cardTitle}>Actions</h2>
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={`${styles.button} ${styles.submitButton}`}
              disabled={loading}
            >
              {loading && <span className={styles.loading}></span>}
              {loading 
                ? isRescheduling ? "Rescheduling..." : "Creating..." 
                : isRescheduling ? "Reschedule Appointment" : "Create Appointment"}
            </button>
            <button 
              type="button" 
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => router.push("/pages/receptionist/view-appointments")}
            >
              Back to Appointments
            </button>
          </div>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}
        </div>
      </form>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAppointment}
        details={appointmentSummary}
      />
    </motion.div>
  );
};

export default withReceptionistAuth(AppointmentForm);