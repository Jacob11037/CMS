"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import axiosPrivate from "../../../../../utils/axiosPrivate";
import "../../../styles/appointmentform.css";

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    start_time: "",
    end_time: "",
    status: "Pending",
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsRes = await axiosPrivate.get("doctors/");
        setDoctors(doctorsRes.data);
        console.log(doctorsRes);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchData();
  }, []);

  // Debounce Effect for Searching Patients
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetchPatients(searchQuery);
      } else {
        setFilteredPatients([]); // Clear results if query is empty or too short
      }
    }, 300); // Wait 300ms before making the API call

    return () => clearTimeout(delayDebounceFn); // Cleanup function
  }, [searchQuery]);

  // Fetch patients based on search query
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

  const validateForm = () => {
    let newErrors = {};
    const now = new Date(); // Current date and time
    const maxFutureDate = new Date();
    maxFutureDate.setDate(now.getDate() + 3); // 3 days in the future
  
    // Check if patient is selected
    if (!formData.patient) newErrors.patient = "Patient is required.";
  
    // Check if doctor is selected
    if (!formData.doctor) newErrors.doctor = "Doctor is required.";
  
    // Check if start time is selected
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required.";
    } else {
      const startTime = new Date(formData.start_time);
  
      // Check if start time is in the past
      if (startTime < now) {
        newErrors.start_time = "Start time cannot be in the past.";
      }
  
      // Check if start time is more than 3 days in the future
      if (startTime > maxFutureDate) {
        newErrors.start_time = "Start time cannot be more than 3 days in the future.";
      }
    }
  
    // Check if end time is selected
    if (!formData.end_time) {
      newErrors.end_time = "End time is required.";
    } else {
      const endTime = new Date(formData.end_time);
  
      // Check if end time is in the past
      if (endTime < now) {
        newErrors.end_time = "End time cannot be in the past.";
      }
  
      // Check if end time is more than 3 days in the future
      if (endTime > maxFutureDate) {
        newErrors.end_time = "End time cannot be more than 3 days in the future.";
      }
  
      // Check if end time is after start time
      if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
        newErrors.end_time = "End time must be after start time.";
      }
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axiosPrivate.post("appointments/", formData);
      setSuccessMessage("Appointment successfully created!");
      setFormData({ patient: "", doctor: "", start_time: "", end_time: "", status: "Pending" });
      setSearchQuery(""); // Reset search query after form submission
      setFilteredPatients([]); // Clear filtered patients after form submission
    } catch (error) {
      setErrors({ submit: "Failed to create appointment. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate back to the receptionist profile
  const goBackToProfile = () => {
    router.push("/pages/receptionist/profile"); // Replace with the actual profile route
  };

  return (
    <div className="container">
      <h1 className="header">Create Appointment</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form className="form" onSubmit={handleSubmit}>
        {/* Patient Search */}
        <div className="form-group">
          <label>Search Patient:</label>
          <input
            type="text"
            placeholder="Search by name, phone, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Show Filtered Patient Options */}
        {filteredPatients.length > 0 && (
          <div className="patient-results">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  setFormData((prevData) => ({ ...prevData, patient: patient.id }));
                  setSearchQuery(`${patient.first_name} ${patient.last_name}`);
                  setFilteredPatients([]);
                }}
              >
                {patient.first_name} {patient.last_name} ({patient.phone})
              </div>
            ))}
          </div>
        )}

        {errors.patient && <p className="error-message">{errors.patient}</p>}

        <div className="form-group">
          <label>Doctor:</label>
          <select name="doctor" value={formData.doctor} onChange={handleChange} className="input-field">
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.staff_id} value={doctor.staff_id}>
                Dr. {doctor.first_name} {doctor.last_name}
              </option>
            ))}
          </select>
          {errors.doctor && <p className="error-message">{errors.doctor}</p>}
        </div>

        {/* Start Time */}
        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="input-field"
          />
          {errors.start_time && <p className="error-message">{errors.start_time}</p>}
        </div>

        {/* End Time */}
        <div className="form-group">
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="input-field"
          />
          {errors.end_time && <p className="error-message">{errors.end_time}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Creating..." : "Create Appointment"}
        </button>

        {/* Go Back Button */}
        <button
          type="button" // Ensure this is a button and not a submit button
          className="button secondary-button" // Add a secondary class for styling
          onClick={goBackToProfile}
        >
          Go Back to Profile
        </button>

        {errors.submit && <p className="error-message">{errors.submit}</p>}
      </form>
    </div>
  );
};

export default AppointmentForm;