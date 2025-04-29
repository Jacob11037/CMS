"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import axiosPrivate from "../../../../../utils/axiosPrivate";
import "../../../styles/appointmentform.css";
import withReceptionistAuth from "@/app/middleware/withReceptionistAuth";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';


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
      <div className="modal-overlay">
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Confirm Appointment</h2>
          <ul>
            <li><strong>Patient:</strong> {details.patient}</li>
            <li><strong>Department:</strong> {details.department}</li>
            <li><strong>Doctor:</strong> {details.doctor}</li>
            <li><strong>Start Time:</strong> {details.start_time}</li>
            <li><strong>End Time:</strong> {details.end_time}</li>
            <li><strong>Consultation Fee:</strong> ${details.fee}</li>
          </ul>
          <div className="modal-buttons">
            <button onClick={onConfirm}>Confirm</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, doctorsRes] = await Promise.all([
          axiosPrivate.get("departments/"),
          axiosPrivate.get("doctors/")
        ]);
        setDepartments(deptRes.data);
        setDoctors(doctorsRes.data);
        console.log(doctors)

        // Check for reschedule params
        if (searchParams.get('reschedule')) {
          setIsRescheduling(true);
          const patientId = searchParams.get('patient');
          const doctorId = searchParams.get('doctor');
          const startTime = searchParams.get('start_time');
          const endTime = searchParams.get('end_time');

          if (patientId && doctorId) {
            // Fetch patient details
            try {
              const patientRes = await axiosPrivate.get(`patients/${patientId}/`);
              const patient = patientRes.data;
              
              // Set form data
              setFormData({
                patient: patient.id,
                doctor: doctorId,
                start_time: startTime || "",
                end_time: endTime || "",
                status: "Pending",
              });
              
              // Set search query
              setSearchQuery(`${patient.first_name} ${patient.last_name}`);
              
              // Find department for the doctor
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
  }, []);

  // Filter doctors by selected department
  useEffect(() => {
    if (selectedDepartment) {
      const filtered = doctors.filter(doctor => 
        doctor.department_id == selectedDepartment
      );
      setFilteredDoctors(filtered);
      // Reset doctor selection when department changes
      setFormData(prev => ({ ...prev, doctor: "" }));
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedDepartment, doctors]);

  // Patient search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {

      if (justSelected) {
        setJustSelected(false); // Reset flag, skip this search
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
    
    // Validate that end time is after start time
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const combinedData = {
      ...formData,
      end_time: formData.start_time 
        ? `${formData.start_time.split('T')[0]}T${formData.end_time || '00:00'}`
        : ''
    };
  
    if (!validateForm(combinedData)) return;
  
    // Get display names
    const selectedDoctor = doctors.find(doc => doc.staff_id === combinedData.doctor);
    const selectedDept = departments.find(dep => dep.id == selectedDepartment);
    const patientDisplay = searchQuery || "Selected Patient";
  
    const summary = {
      patient: patientDisplay,
      doctor: selectedDoctor 
        ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` 
        : "",
      department: selectedDept?.department_name || "",
      start_time: combinedData.start_time,
      end_time: combinedData.end_time,
      fee: selectedDept?.fee || 0
    };
  
    setAppointmentSummary(summary);
    setShowConfirmModal(true);
  };

  const confirmAppointment = async () => {
    setShowConfirmModal(false);
  
    const finalData = {
      ...formData,
      end_time: formData.start_time 
        ? `${formData.start_time.split('T')[0]}T${formData.end_time || '00:00'}`
        : ''
    };
  
    try {
      setLoading(true);
      await axiosPrivate.post("appointments/", finalData);
  
      toast.success(isRescheduling ? "Appointment rescheduled!" : "Appointment created!");
  
      // Reset
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
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  

return (
  <motion.div 
    className="container"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <h1 className="header">
      {isRescheduling ? 'Reschedule Appointment' : 'Create Appointment'}
    </h1>

    <form onSubmit={handleSubmit} className="form">

      {/* Card 1: Patient Info */}
      <div className="card">
        <h2 className="card-title">Patient Information</h2>
        <div className="form-group">
          <label>Search Patient:</label>
          <input
            type="text"
            placeholder="Search by name, phone, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isRescheduling}
          />
          {filteredPatients.length > 0 && (
            <div className="dropdown">
              {filteredPatients.map(patient => (
                <div 
                  key={patient.id}
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
          {errors.patient && <span className="error">{errors.patient}</span>}
        </div>
      </div>

      {/* Card 2: Appointment Details */}
      <div className="card">
        <h2 className="card-title">Appointment Details</h2>

        <div className="form-group">
          <label>Department:</label>
          <select 
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

        {selectedDepartment && (() => {
          const selectedDept = departments.find(dep => dep.id == selectedDepartment);
          return (
            <div className="form-group">
              <label>Consultation Fee: </label>
              <p>{selectedDept?.fee || 'N/A'}</p>
            </div>
          );
        })()}

        {selectedDepartment && (
          <div className="form-group">
            <label>Doctor:</label>
            <select
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
            {errors.doctor && <span className="error">{errors.doctor}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
          {errors.start_time && <span className="error">{errors.start_time}</span>}
        </div>

        <div className="form-group">
          <label>End Time:</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
          {errors.end_time && <span className="error">{errors.end_time}</span>}
        </div>
      </div>

      {/* Card 3: Actions */}
      <div className="card">
        <h2 className="card-title">Actions</h2>
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading 
              ? isRescheduling ? "Rescheduling..." : "Creating..." 
              : isRescheduling ? "Reschedule Appointment" : "Create Appointment"}
          </button>
          <button 
            type="button" 
            onClick={() => router.push("/pages/receptionist/view-appointments")}
          >
            Back to Appointments
          </button>
        </div>
        {errors.submit && <div className="error">{errors.submit}</div>}
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