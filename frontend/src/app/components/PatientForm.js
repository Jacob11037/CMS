'use client';
import { useState } from "react";
import axiosPrivate from "../../../utils/axiosPrivate";
import { useRouter } from 'next/navigation';
import "../styles/registerpatient.css";

const PatientForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const validateForm = (formdata) => {
    const formErrors = {};
    const today = new Date();

    if (!formdata.first_name.trim()) {
      formErrors.first_name = "First name cannot be empty.";
    } else if (formdata.first_name.trim().length < 2) {
      formErrors.first_name = "First name must be at least two characters.";
    }

    if (!formdata.last_name.trim()) {
      formErrors.last_name = "Last name cannot be empty.";
    } else if (formdata.last_name.trim().length < 2) {
      formErrors.last_name = "Last name must be at least two characters.";
    }

    if (!formdata.email.trim()) {
      formErrors.email = "Email cannot be empty.";
    } else if (!/\S+@\S+\.\S+/.test(formdata.email)) {
      formErrors.email = "Please enter a valid email address.";
    }

    const birthDate = new Date(formdata.date_of_birth);
    if (!formdata.date_of_birth) {
      formErrors.date_of_birth = "Date of birth cannot be empty.";
    } else if (birthDate >= today) {
      formErrors.date_of_birth = "Date of birth must be in the past.";
    }

    if (!formdata.phone.trim()) {
      formErrors.phone = "Phone number cannot be empty.";
    } else if (!/^\d{10}$/.test(formdata.phone)) {
      formErrors.phone = "Enter a valid phone number (10 digits).";
    }

    if (!formdata.address.trim()) {
      formErrors.address = "Address cannot be empty.";
    }

    if (!formdata.blood_group) {
      formErrors.blood_group = "Please select a blood group.";
    }

    setFieldErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");
    setFieldErrors({});

    if (!validateForm(formData)) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosPrivate.post('patients/', formData);
      setSuccessMessage("Patient successfully Registered!");
      router.push('/pages/receptionist/appointment');
    } catch (error) {
      setErrors("An error occurred while registering the patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="header">Register Patient</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.first_name && <p className="error-message">{fieldErrors.first_name}</p>}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.last_name && <p className="error-message">{fieldErrors.last_name}</p>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.date_of_birth && <p className="error-message">{fieldErrors.date_of_birth}</p>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.phone && <p className="error-message">{fieldErrors.phone}</p>}
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input-field"
          />
          {fieldErrors.address && <p className="error-message">{fieldErrors.address}</p>}
        </div>

        <div className="form-group">
          <label>Blood Group</label>
          <select
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {fieldErrors.blood_group && <p className="error-message">{fieldErrors.blood_group}</p>}
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {errors && <p className="error-message">{errors}</p>}
      </form>
    </div>
  );
};

export default PatientForm;