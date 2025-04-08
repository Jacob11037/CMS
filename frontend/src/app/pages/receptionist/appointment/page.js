"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import axiosPrivate from "../../../../../utils/axiosPrivate";
import "../../../styles/appointmentform.css";
import withReceptionistAuth from "@/app/middleware/withReceptionistAuth";

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    start_time: "",
    end_time: "",
    status: "Pending",
  });

  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

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
      } catch (error) {
        console.error("Error fetching data:", error);
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    
    // Add your existing time validation logic here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axiosPrivate.post("appointments/", formData);
      setSuccessMessage("Appointment created successfully!");
      // Reset form
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
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to create appointment" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Create Appointment</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        {/* Patient Search */}
        <div className="form-group">
          <label>Search Patient:</label>
          <input
            type="text"
            placeholder="Search by name, phone, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  }}
                >
                  {patient.first_name} {patient.last_name} ({patient.phone})
                </div>
              ))}
            </div>
          )}
          {errors.patient && <span className="error">{errors.patient}</span>}
        </div>

        {/* Department Selection */}
        <div className="form-group">
          <label>Department:</label>
          <select 
            value={selectedDepartment} 
            onChange={handleDepartmentChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Selection (only shows when department is selected) */}
        {selectedDepartment && (
          <div className="form-group">
            <label>Doctor:</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
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

        {/* Start Time */}
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

        {/* End Time */}
        <div className="form-group">
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
          {errors.end_time && <span className="error">{errors.end_time}</span>}
        </div>

        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Appointment"}
          </button>
          <button 
            type="button" 
            onClick={() => router.push("/pages/receptionist/profile")}
          >
            Back to Profile
          </button>
        </div>

        {errors.submit && <div className="error">{errors.submit}</div>}
      </form>
    </div>
  );
};

export default withReceptionistAuth(AppointmentForm);